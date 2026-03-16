const express = require('express');
const Database = require('better-sqlite3');
const ical = require('node-ical');
const fetch = require('node-fetch');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',  // allow Chrome extension and any local origin
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.static(process.env.PUBLIC_DIR || path.join(__dirname, '../public')));

// --- DB setup ---
const DB_PATH = process.env.DB_PATH || '/data/bookings.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    checkin TEXT NOT NULL,
    checkout TEXT NOT NULL,
    nights INTEGER,
    guest_name TEXT,
    guest_count INTEGER,
    res_id TEXT,
    hotel_id TEXT,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    scraped_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

// --- Helpers ---
function nights(checkin, checkout) {
  const a = new Date(checkin), b = new Date(checkout);
  return Math.round((b - a) / 86400000);
}

function toDateStr(d) {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

// Match a scraped booking to an existing ical-only record (by overlapping dates ±1 day)
function findMatchingBooking(platform, checkin, checkout) {
  const ci = new Date(checkin);
  const co = new Date(checkout);
  const margin = 86400000;
  const rows = db.prepare(`SELECT * FROM bookings WHERE platform = ? AND status != 'cancelled'`).all(platform);
  for (const row of rows) {
    const rci = new Date(row.checkin);
    const rco = new Date(row.checkout);
    if (Math.abs(rci - ci) <= margin && Math.abs(rco - co) <= margin) return row;
  }
  return null;
}

// --- iCal sync ---
async function syncIcal(platform, url) {
  if (!url) return { added: 0, updated: 0, skipped: 0 };
  let events;
  try {
    events = await ical.async.fromURL(url);
  } catch (e) {
    console.error(`iCal fetch failed for ${platform}:`, e.message);
    return { error: e.message };
  }

  let added = 0, updated = 0, cancelled = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Collect all current ical IDs from this sync to detect deletions
  const seenIds = new Set();

  for (const key of Object.keys(events)) {
    const ev = events[key];
    if (ev.type !== 'VEVENT') continue;

    const checkin = toDateStr(ev.start);
    const checkout = toDateStr(ev.end);
    if (!checkin || !checkout) continue;

    const summary = (ev.summary || '').toLowerCase();
    const isCancelled = summary.includes('cancelled') || summary.includes('canceled') || ev.status === 'CANCELLED';
    const icalId = `${platform}_ical_${ev.uid || key}`;
    seenIds.add(icalId);

    if (isCancelled) {
      // Mark as cancelled if we have it
      const existing = db.prepare('SELECT id FROM bookings WHERE id = ?').get(icalId);
      if (existing) {
        db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(icalId);
        cancelled++;
      }
      continue;
    }

    if (new Date(checkout) < today) continue; // skip past

    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(icalId);
    if (!existing) {
      db.prepare(`INSERT INTO bookings (id, platform, checkin, checkout, nights, status, created_at)
                  VALUES (?, ?, ?, ?, ?, 'confirmed', datetime('now'))`)
        .run(icalId, platform, checkin, checkout, nights(checkin, checkout));
      added++;
    } else {
      // Update dates (they can shift), but don't overwrite scraped details
      db.prepare(`UPDATE bookings SET checkin=?, checkout=?, nights=? WHERE id=?`)
        .run(checkin, checkout, nights(checkin, checkout), icalId);
      updated++;
    }
  }

  // Any ical record for this platform NOT seen in this sync = removed from platform = cancel it
  const allIcalIds = db.prepare(`SELECT id FROM bookings WHERE platform=? AND id LIKE ?`)
    .all(platform, `${platform}_ical_%`);
  for (const row of allIcalIds) {
    if (!seenIds.has(row.id)) {
      db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(row.id);
      cancelled++;
    }
  }

  setSetting(`last_sync_${platform}`, new Date().toISOString());
  return { added, updated, cancelled };
}

async function syncAll() {
  const airbnbUrl = db.prepare("SELECT value FROM settings WHERE key='airbnb_ical'").get()?.value;
  const bookingUrl = db.prepare("SELECT value FROM settings WHERE key='booking_ical'").get()?.value;
  const r1 = await syncIcal('airbnb', airbnbUrl);
  const r2 = await syncIcal('booking', bookingUrl);
  setSetting('last_sync', new Date().toISOString());
  console.log(`[sync] airbnb: ${JSON.stringify(r1)} | booking: ${JSON.stringify(r2)}`);
  return { airbnb: r1, booking: r2 };
}

// Sync every 4 hours
cron.schedule('0 */4 * * *', syncAll);

// --- API Routes ---

app.get('/api/bookings', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare(`
    SELECT * FROM bookings
    WHERE checkout >= ? AND status != 'cancelled'
    ORDER BY checkin ASC
  `).all(today);
  res.json(rows);
});

app.get('/api/bookings/past', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const ago = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const rows = db.prepare(`
    SELECT * FROM bookings
    WHERE checkout < ? AND checkin >= ?
    ORDER BY checkin DESC
  `).all(today, ago);
  res.json(rows);
});

// POST from Chrome extension scraper
app.post('/api/ingest', (req, res) => {
  const { platform, checkin, checkout, guest_name, guest_count, res_id, hotel_id, status } = req.body;

  if (!platform || !checkin || !checkout) {
    return res.status(400).json({ error: 'platform, checkin, checkout required' });
  }

  const normalStatus = (status || 'confirmed').toLowerCase();
  if (normalStatus === 'cancelled' || normalStatus === 'canceled') {
    const match = findMatchingBooking(platform, checkin, checkout);
    if (match) {
      db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(match.id);
      return res.json({ action: 'cancelled', id: match.id });
    }
    // Also try by res_id
    if (res_id) {
      const byResId = db.prepare("SELECT id FROM bookings WHERE res_id=? AND platform=?").get(res_id, platform);
      if (byResId) {
        db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(byResId.id);
        return res.json({ action: 'cancelled', id: byResId.id });
      }
    }
    return res.json({ action: 'ignored', reason: 'cancelled and not found' });
  }

  const ci = toDateStr(checkin);
  const co = toDateStr(checkout);
  const n = nights(ci, co);

  console.log(`[ingest] ${platform} res_id=${res_id} ${ci} -> ${co} guest="${guest_name}" count=${guest_count}`);

  // Try match by res_id first (most reliable), then by dates
  let match = null;
  if (res_id) {
    match = db.prepare("SELECT * FROM bookings WHERE res_id=? AND platform=?").get(res_id, platform);
    if (match) console.log(`[ingest] matched by res_id: ${match.id}`);
  }
  if (!match) {
    match = findMatchingBooking(platform, ci, co);
    if (match) console.log(`[ingest] matched by dates: ${match.id}`);
    else console.log(`[ingest] no match found — will insert new record`);
  }

  if (match) {
    // Always overwrite with incoming scraped values when provided;
    // only fall back to existing DB value when incoming is null/undefined
    db.prepare(`UPDATE bookings SET
      checkin = ?,
      checkout = ?,
      nights = ?,
      guest_name = CASE WHEN ? IS NOT NULL THEN ? ELSE guest_name END,
      guest_count = CASE WHEN ? IS NOT NULL THEN ? ELSE guest_count END,
      res_id = CASE WHEN ? IS NOT NULL THEN ? ELSE res_id END,
      hotel_id = CASE WHEN ? IS NOT NULL THEN ? ELSE hotel_id END,
      status = 'confirmed',
      scraped_at = datetime('now')
      WHERE id = ?
    `).run(
      ci, co, n,
      guest_name || null, guest_name || null,
      guest_count || null, guest_count || null,
      res_id || null, res_id || null,
      hotel_id || null, hotel_id || null,
      match.id
    );
    return res.json({ action: 'updated', id: match.id });
  }

  // No match — insert new
  const newId = `${platform}_scraped_${res_id || Date.now()}`;
  db.prepare(`INSERT OR REPLACE INTO bookings
    (id, platform, checkin, checkout, nights, guest_name, guest_count, res_id, hotel_id, status, scraped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', datetime('now'))
  `).run(newId, platform, ci, co, n, guest_name || null, guest_count || null, res_id || null, hotel_id || null);
  return res.json({ action: 'created', id: newId });
});

app.delete('/api/bookings/:id', (req, res) => {
  db.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = {};
  rows.forEach(r => out[r.key] = r.value);
  res.json(out);
});

app.post('/api/settings', (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    setSetting(key, value);
  }
  syncAll();
  res.json({ ok: true });
});

app.post('/api/sync', async (req, res) => {
  const result = await syncAll();
  res.json({ ok: true, result });
});

// Clean up obviously wrong guest_name values left by previous scraper bugs
function cleanBadData() {
  const bad = [
    'Payment Details', 'payment details',
    'Guest payment', 'guest payment',
    'Check-in', 'Check-out',
  ];
  let cleaned = 0;
  for (const name of bad) {
    const result = db.prepare("UPDATE bookings SET guest_name = NULL WHERE guest_name = ?").run(name);
    cleaned += result.changes;
  }
  // Also clear any guest_name that looks like a UI label (no space, all caps first word, ends in 's' etc)
  const suspicious = db.prepare("SELECT id, guest_name FROM bookings WHERE guest_name IS NOT NULL").all();
  for (const row of suspicious) {
    const n = row.guest_name;
    // Real names have at least two words, or a single word. UI labels tend to be title case phrases.
    // Flag if it contains digits, or matches known bad patterns
    if (/\d/.test(n) || /^(Payment|Guest|Check|Booking|Details|Total|Amount)/i.test(n)) {
      db.prepare("UPDATE bookings SET guest_name = NULL WHERE id = ?").run(row.id);
      cleaned++;
    }
  }
  if (cleaned > 0) console.log(`[cleanup] Cleared ${cleaned} bad guest_name values`);
}

const PORT = process.env.PORT || 3210;
app.listen(PORT, () => {
  console.log(`Booking server running on :${PORT}`);
  // Small delay so DB WAL is settled, then sync
  cleanBadData();
  setTimeout(() => {
    syncAll()
      .then(r => console.log('[startup sync done]', JSON.stringify(r)))
      .catch(e => console.error('[startup sync error]', e.message));
  }, 2000);
});
