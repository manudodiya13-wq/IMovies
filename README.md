# iMovies – Movie ticket booking (MERN, JavaScript only)

```
IMovies/
├── server/   Express + MongoDB (Mongoose) REST API
└── client/   React (Vite) single-page app
```

## Requirements
- Node.js 20.19+ or 22+  (check: `node -v`)
- MongoDB Community Server running locally, OR a free MongoDB Atlas connection string

## Run it
**Terminal 1 – backend**
```bash
cd IMovies/server
npm install
npm run seed      # creates the admin + sample movies, theatre and shows
npm run dev       # http://localhost:5000  (health check: /api/health)
```
**Terminal 2 – frontend**
```bash
cd IMovies/client
npm install
npm run dev       # http://localhost:5173
```
Open http://localhost:5173

## Logins
- Customer: use **Sign up** on the site.
- Admin: http://localhost:5173/admin/login → `admin@imovies.com` / `Admin@123` (from `server/.env`)

## Features
**Customer:** register/login, browse & search movies (genre, language, sort, pagination), now showing / upcoming,
movie details, trailer link, reviews & ratings, favourites & watchlist, shows by date/city, live seat map
(Regular / Premium / Recliner), 10-minute seat hold with countdown, payment (card / UPI / net banking / wallet – simulated gateway),
e-ticket with booking ID, booking history, cancellation (up to 2 hours before show), profile & password update.

**Admin:** dashboard (revenue, tickets, top movies, last 7 days), manage movies, theatres & screens (seat layouts),
shows (with prices), users (block / delete), all bookings (cancel / refund).

## Test payment values
- Card: any 16 digits (e.g. `4111 1111 1111 1111`). A card ending `0000` is declined on purpose.
- UPI: `name@upi`
- Emails are printed in the server console unless SMTP is set in `server/.env`.

## Troubleshooting
| Problem | Fix |
|---|---|
| `Could not connect to MongoDB` | Start MongoDB (Windows: Services → MongoDB Server → Start) or put your Atlas URI in `MONGO_URI` |
| `EADDRINUSE :5000` | Another app uses port 5000 – change `PORT` in `server/.env` **and** the proxy target in `client/vite.config.js` |
| Login works but pages say "Not authorised" | Open the site via http://localhost:5173 (not 127.0.0.1) and keep both servers running |
| No shows visible | Seeded shows start 24h/29h from when you ran `npm run seed`; add more in Admin → Shows |
