# CulChar platform

The business system behind CulChar: the public quote builder, the admin portal and the client tracker. It started as a copy of the Thabiso Mhlongo booking platform (same author) with all of his data, images and identity removed, and is being reshaped for CulChar phase by phase. See the CulChar Platform Plan for the phases.

Node.js 22, Express 5, SQLite, plain HTML and JavaScript. No build step.

## Run it locally

```
cp .env.example .env      # then fill in your own values
npm ci
npm start                 # http://localhost:3000
```

A fresh start builds an empty database at `DB_PATH`. On the first start the server creates an administrator for `ADMIN_EMAIL` and writes a one-time password to `data/admin_credentials.txt`. Sign in, change the password, then delete that file.

## Tests

```
npm test                  # integration suite on a throwaway, empty database
npm run smoke
```

The tests never copy a real database: every run starts from an empty one, so no client's personal information is used in testing. Some suites still assume the old entertainer price list and will be rewritten when the CulChar catalogue lands (Phase 2).

## Folder structure

```
server.js, app.js        Express entry point and remaining route wiring
database.js              Schema, migrations and default seeds
database/repositories/   SQL by domain (bookings, invoices, finance, calendar, users)
routes/admin/            Admin portal API, one file per area
routes/public/           Public API: bookings, payments, POPIA, site content
lib/                     Business logic: invoicing, payments, EFT, PayFast, POPIA, notifications
middleware/              Auth, roles, rate limits
js/, css/                Browser code and styles for the admin portal and public pages
test/                    Integration, browser and golden-file tests
docs-internal/           Technical notes per subsystem
```

## Security

- Secrets live only in `.env` on the server. Never commit `.env`, databases, uploads or generated documents; `.gitignore` blocks them and CI fails if one slips in.
- Every admin route checks the user's role on the server.
- Production dependencies are kept at zero known vulnerabilities (`npm audit --omit=dev`), checked in CI.
- Report a security problem as described in `SECURITY.md` at the repo root.
