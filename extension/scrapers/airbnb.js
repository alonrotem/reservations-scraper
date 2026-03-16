// Airbnb host reservations scraper
// List page: reads the reservations table (Status/Guests/Check-in/Checkout/Confirmation Code columns)
// Detail page: reads __NEXT_DATA__ or page JSON

(function () {
  function ingest(data) {
    console.log('[Alonia Airbnb] Sending:', JSON.stringify(data));
    chrome.runtime.sendMessage({ type: 'INGEST', payload: { platform: 'airbnb', ...data } }, (resp) => {
      if (chrome.runtime.lastError) { console.error('[Alonia Airbnb] Msg error:', chrome.runtime.lastError.message); return; }
      console.log('[Alonia Airbnb] Server response:', JSON.stringify(resp));
    });
  }

  function toISO(str) {
    if (!str) return null;
    str = str.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // "Jun 19, 2026" or "Jun 19" (current year fallback)
    const d = new Date(str);
    if (!isNaN(d) && d.getFullYear() > 2020) return d.toISOString().slice(0, 10);
    // Add current year if missing
    if (/^[A-Z][a-z]{2}\s+\d{1,2}$/.test(str)) {
      const d2 = new Date(str + ', ' + new Date().getFullYear());
      if (!isNaN(d2)) return d2.toISOString().slice(0, 10);
    }
    return null;
  }

  function parseGuestCount(str) {
    if (!str) return null;
    let total = 0;
    for (const m of str.matchAll(/(\d+)\s*(?:adult|child|infant|guest)/gi)) {
      total += parseInt(m[1]);
    }
    return total > 0 ? total : null;
  }

  function parseGuestName(cell) {
    if (!cell) return null;
    // Name is in span[data-button-content="true"] inside the guests <td>
    if (cell && cell.querySelector) {
      const nameEl = cell.querySelector('[data-button-content="true"]');
      if (nameEl && nameEl.textContent.trim()) return nameEl.textContent.trim();
    }
    // Fallback for string: "Dimo Kolchev2 adults" — no space before digit
    const text = (typeof cell === 'string' ? cell : (cell.textContent || '')).trim();
    const m = text.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s'\-\.]*?)(?=\d|$)/);
    if (m && m[1].trim().length > 1) return m[1].trim();
    return null;
  }

  // ── List page: reads the <table> with reservations ─────────────────────
  function scrapeListPage() {
    console.log('[Alonia Airbnb] List page — scanning table...');
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      if (attempts > 20) { clearInterval(interval); console.warn('[Alonia Airbnb] Gave up on list'); return; }

      const table = document.querySelector('table');
      if (!table) { console.log('[Alonia Airbnb] Attempt', attempts, ': no table yet'); return; }

      // Map header index → column name
      const headers = [...table.querySelectorAll('th')].map(th => th.textContent.trim().toLowerCase());
      console.log('[Alonia Airbnb] Table headers:', headers);

      const idxStatus   = headers.findIndex(h => h.includes('status'));
      const idxGuests   = headers.findIndex(h => h.includes('guest'));
      const idxCheckin  = headers.findIndex(h => h.includes('check-in') || h.includes('checkin'));
      const idxCheckout = headers.findIndex(h => h.includes('checkout') || h.includes('check-out'));
      const idxCode     = headers.findIndex(h => h.includes('confirmation'));

      if (idxCheckin === -1 || idxCheckout === -1) {
        console.log('[Alonia Airbnb] Attempt', attempts, ': headers not found yet', headers);
        return;
      }

      const rows = [...table.querySelectorAll('tr')].slice(1); // skip header
      console.log('[Alonia Airbnb] Found', rows.length, 'data rows');

      let sent = 0;
      for (const row of rows) {
        const tdEls = [...row.querySelectorAll('td')];
        if (!tdEls.length) continue;
        const cells = tdEls.map(td => td.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim());

        const status = idxStatus >= 0 ? cells[idxStatus] : '';
        if (/cancel/i.test(status)) continue;

        const checkin  = toISO(cells[idxCheckin]);
        const checkout = toISO(cells[idxCheckout]);
        const resId    = idxCode >= 0 ? cells[idxCode]?.trim() : null;
        const guestsTd  = idxGuests >= 0 ? tdEls[idxGuests] : null;
        const guestsRaw = idxGuests >= 0 ? cells[idxGuests] : '';
        const guestName  = parseGuestName(guestsTd);
        const guestCount = parseGuestCount(guestsRaw);

        console.log('[Alonia Airbnb] Row:', { checkin, checkout, resId, guestName, guestCount, guestsRaw });

        if (checkin && checkout) {
          ingest({ checkin, checkout, res_id: resId, guest_name: guestName, guest_count: guestCount, status: 'confirmed' });
          sent++;
        }
      }

      if (sent > 0) {
        console.log('[Alonia Airbnb] Sent', sent, 'reservations from table');
        clearInterval(interval);
        showToast(`Alonia: synced ${sent} Airbnb reservation${sent > 1 ? 's' : ''}`);
      }
    }, 1500);
  }

  // ── Detail page ────────────────────────────────────────────────────────
  function scrapeDetailPage() {
    const resId = location.pathname.split('/').filter(Boolean).pop();
    console.log('[Alonia Airbnb] Detail page, res_id:', resId);
    let attempts = 0, done = false;

    const interval = setInterval(() => {
      if (done) return;
      attempts++;
      if (attempts > 20) { clearInterval(interval); return; }

      let checkin = null, checkout = null, guestName = null, guestCount = null;

      // Try all inline JSON blobs
      const scripts = [
        document.getElementById('__NEXT_DATA__'),
        ...document.querySelectorAll('script[type="application/json"]'),
        ...document.querySelectorAll('script:not([src])'),
      ].filter(Boolean);

      for (const s of scripts) {
        try {
          const str = s.textContent || '';
          if (!str.includes('checkIn') && !str.includes('check_in')) continue;
          const ci = str.match(/"checkIn"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
          const co = str.match(/"checkOut"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
          if (ci && co) {
            checkin = ci[1]; checkout = co[1];
            const gc = str.match(/"guestCount"\s*:\s*(\d+)/);
            const nm = str.match(/"preferredName"\s*:\s*"([^"]{2,40})"/) || str.match(/"firstName"\s*:\s*"([^"]{2,30})"/);
            if (gc) guestCount = parseInt(gc[1]);
            if (nm) guestName = nm[1];
            break;
          }
        } catch(e) {}
      }

      // Text fallback: "Mar 22 – Mar 25, 2026"
      if (!checkin) {
        const text = document.body.innerText;
        const m = text.match(/([A-Z][a-z]{2})\s+(\d{1,2})\s*[–\-]\s*([A-Z][a-z]{2})\s+(\d{1,2}),?\s*(20\d{2})/);
        if (m) { checkin = toISO(`${m[1]} ${m[2]}, ${m[5]}`); checkout = toISO(`${m[3]} ${m[4]}, ${m[5]}`); }
      }

      console.log('[Alonia Airbnb] Detail attempt', attempts, ':', { checkin, checkout, guestName });

      if (checkin && checkout) {
        done = true; clearInterval(interval);
        ingest({ checkin, checkout, guest_name: guestName, guest_count: guestCount, res_id: resId, status: 'confirmed' });
        showToast('Alonia: Airbnb reservation scraped ✓');
      }
    }, 1500);
  }

  // ── Toast notification ─────────────────────────────────────────────────
  function showToast(msg) {
    const existing = document.getElementById('alonia-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'alonia-toast';
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '999999',
      background: '#1a3a5c', color: '#fff', fontFamily: 'system-ui, sans-serif',
      fontSize: '13px', fontWeight: '500', padding: '10px 16px',
      borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      opacity: '0', transition: 'opacity 0.3s ease', pointerEvents: 'none',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 4000);
  }

  // ── Route ──────────────────────────────────────────────────────────────
  if (location.pathname.includes('/hosting/reservations/details/')) {
    scrapeDetailPage();
  } else {
    scrapeListPage();
  }
})();
