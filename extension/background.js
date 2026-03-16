// Background service worker

// Keep alive — MV3 service workers go idle after 30s
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20000);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'INGEST') {
    handleIngest(msg.payload).then(sendResponse).catch(e => {
      console.error('[Alonia BG] Ingest error:', e.message);
      sendResponse({ error: e.message });
    });
    return true;
  }
  if (msg.type === 'PING') {
    handlePing(msg.url).then(sendResponse).catch(e => sendResponse({ ok: false, error: e.message }));
    return true;
  }
});

async function getBase() {
  const data = await chrome.storage.sync.get(['serverUrl']);
  return (data.serverUrl || 'http://localhost:3210').replace(/\/$/, '');
}

async function handlePing(url) {
  const target = (url || await getBase()).replace(/\/$/, '');
  console.log('[Alonia BG] Pinging:', target);
  try {
    const r = await fetch(`${target}/api/bookings`);
    console.log('[Alonia BG] Ping result:', r.status);
    return { ok: r.ok, status: r.status };
  } catch(e) {
    console.error('[Alonia BG] Ping failed:', e.message);
    return { ok: false, error: e.message };
  }
}

async function handleIngest(payload) {
  const base = await getBase();
  console.log('[Alonia BG] POST', base, JSON.stringify(payload));
  const res = await fetch(`${base}/api/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  console.log('[Alonia BG] Response:', JSON.stringify(json));
  chrome.action.setBadgeText({ text: json.error ? '!' : '✓' });
  chrome.action.setBadgeBackgroundColor({ color: json.error ? '#ef4444' : '#22c55e' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
  return json;
}
