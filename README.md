# Apartment Bookings Dashboard

Unified booking dashboard for Airbnb + Booking.com, running in Docker.

## Architecture

```
apt-bookings/
├── server/          Node.js + Express + SQLite
│   ├── index.js     API server
│   ├── package.json
│   └── Dockerfile
├── public/
│   └── index.html   Single-page dashboard (EN/BG)
├── extension/       Chrome extension (scraper)
│   ├── manifest.json
│   ├── popup.html
│   └── scrapers/
│       ├── airbnb.js
│       └── booking.js
├── data/            SQLite DB (auto-created, persisted via volume)
└── docker-compose.yml
```

## Quick start

```bash
git clone / copy this folder
cd apt-bookings
docker compose up -d
# Dashboard → http://localhost:3000
```

## iCal setup

1. Open http://localhost:3000
2. Click ⚙ Settings
3. Paste your iCal URLs:
   - **Airbnb**: Calendar → Availability settings → Export Calendar → copy `.ics` URL
   - **Booking.com**: Calendar → Sync calendar → Export → copy `.ics` URL (dates only)
4. Click Save & sync

iCal auto-syncs every 4 hours. Airbnb iCal includes guest first name. Booking.com iCal has dates only.

## Chrome Extension setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `extension/` folder
4. Click the extension icon → confirm server URL is `http://localhost:3000` (green dot = connected)

### How scraping works

- Browse **Airbnb** → `airbnb.com/hosting/reservations` or any individual reservation detail page
  - The extension reads guest name, dates, guest count, confirmation code from the page
- Browse **Booking.com** → open any reservation in the extranet (`admin.booking.com/...manage/booking?res_id=...`)
  - Extension reads res_id and hotel_id from the URL, and name/dates/guests from the page
- Both send a `POST /api/ingest` request to your server
- If a matching iCal record exists (same dates ±1 day), it gets enriched with details
- If no match, a new record is created
- Cancelled reservations are automatically marked and hidden

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookings` | All upcoming bookings |
| GET | `/api/bookings/past` | Past 90 days |
| POST | `/api/ingest` | Receive scraped booking (from extension) |
| DELETE | `/api/bookings/:id` | Cancel/hide a booking |
| GET | `/api/settings` | Get iCal URLs + last sync time |
| POST | `/api/settings` | Update settings (triggers sync) |
| POST | `/api/sync` | Manual sync trigger |

### Ingest payload (from extension or manual POST)

```json
{
  "platform": "airbnb" | "booking",
  "checkin": "2026-04-01",
  "checkout": "2026-04-05",
  "guest_name": "Klaus Weber",
  "guest_count": 2,
  "res_id": "5504092665",
  "hotel_id": "10660623",
  "status": "confirmed" | "cancelled"
}
```

## Notes

- The SQLite database lives in `./data/bookings.db` (persisted across restarts)
- The extension content scripts use a polling strategy to wait for dynamic React content to load
- Scraper selectors may need updating if Airbnb/Booking change their DOM — check browser console for `[BookingScraper]` logs
- If running on a remote server, update the extension popup URL from `localhost:3000` to your server's IP/domain
