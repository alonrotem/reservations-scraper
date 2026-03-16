// Booking.com extranet reservation scraper
// Selectors verified against live extranet HTML

(function () {
  function ingest(data) {
    console.log('[Alonia Booking] Sending:', JSON.stringify(data));
    chrome.runtime.sendMessage({ type: 'INGEST', payload: { platform: 'booking', ...data } }, (resp) => {
      if (chrome.runtime.lastError) { console.error('[Alonia Booking] Msg error:', chrome.runtime.lastError.message); return; }
      console.log('[Alonia Booking] Server response:', JSON.stringify(resp));
    });
  }

  function parseDate(str) {
    if (!str) return null;
    str = str.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const d = new Date(str);
    if (!isNaN(d) && d.getFullYear() > 2020) return d.toISOString().slice(0, 10);
    return null;
  }

  // Find a label paragraph by its text, then return the text of the next sibling p
  function getValueAfterLabel(labelText) {
    const labels = document.querySelectorAll('p.res-content__label');
    for (const label of labels) {
      if (label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
        const next = label.nextElementSibling;
        if (next) return next.textContent.trim();
      }
    }
    return null;
  }

  const urlParams = new URLSearchParams(location.search);
  const resId = urlParams.get('res_id');
  const hotelId = urlParams.get('hotel_id');

  if (!resId) { console.warn('[Alonia Booking] No res_id in URL'); return; }
  console.log('[Alonia Booking] Starting — res_id:', resId, 'hotel_id:', hotelId);


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
  let attempts = 0, done = false;

  const interval = setInterval(() => {
    if (done) return;
    attempts++;
    if (attempts > 20) {
      clearInterval(interval);
      console.warn('[Alonia Booking] Timed out — sending with IDs only');
      ingest({ res_id: resId, hotel_id: hotelId, checkin: null, checkout: null, status: 'confirmed' });
      return;
    }

    if (!document.body || document.body.innerText.length < 200) return;

    // ── Cancellation ──────────────────────────────────────────────────────
    if (/cancel(l?ed|ation)/i.test(document.body.innerText.slice(0, 800))) {
      done = true; clearInterval(interval);
      console.log('[Alonia Booking] Cancelled');
      ingest({ res_id: resId, hotel_id: hotelId, checkin: '2000-01-01', checkout: '2000-01-02', status: 'cancelled' });
      return;
    }

    // ── Guest name: data-test-id="reservation-overview-name" ─────────────
    const nameEl = document.querySelector('[data-test-id="reservation-overview-name"]');
    const guestName = nameEl?.textContent?.trim() || null;

    // ── Dates: p.res-content__label → next p.res-content__info span ───────
    const checkinRaw = getValueAfterLabel('Check-in');
    const checkoutRaw = getValueAfterLabel('Check-out');
    const checkin = parseDate(checkinRaw);
    const checkout = parseDate(checkoutRaw);

    // ── Guest count: "2 adults, 1 child" → sum adults + children ──────────
    let guestCount = null;
    const guestsRaw = getValueAfterLabel('Total guests');
    if (guestsRaw) {
      let total = 0;
      const adults = guestsRaw.match(/(\d+)\s*adult/i);
      const children = guestsRaw.match(/(\d+)\s*child/i);
      const infants = guestsRaw.match(/(\d+)\s*infant/i);
      if (adults) total += parseInt(adults[1]);
      if (children) total += parseInt(children[1]);
      if (infants) total += parseInt(infants[1]);
      if (total > 0) guestCount = total;
      // Fallback: plain number
      if (!guestCount) {
        const plain = guestsRaw.match(/^(\d+)$/);
        if (plain) guestCount = parseInt(plain[1]);
      }
    }

    console.log('[Alonia Booking] Attempt', attempts, '— name:', guestName, 'checkin:', checkin, 'checkout:', checkout, 'guests:', guestCount, '(raw:', guestsRaw + ')');

    // Need at least dates to proceed (name is optional — may load later)
    if (checkin && checkout) {
      done = true; clearInterval(interval);
      console.log('[Alonia Booking] SUCCESS');
      showToast('Alonia: Booking.com reservation scraped ✓');
      ingest({ checkin, checkout, guest_name: guestName, guest_count: guestCount, res_id: resId, hotel_id: hotelId, status: 'confirmed' });
    }
  }, 1000);
})();
