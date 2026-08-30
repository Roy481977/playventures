# Rain Gibraltar — Operating Model

Single-file interactive 36-month operating model (`index.html`) for the Gibraltar dual-licence plan:
**Playmarkets** (B2C Gaming Operator Licence — full casino engine: GEO cohorts, GGR/NGR, bonuses,
affiliates, payments, 0.15% duty) + **Rain B2C** (Prediction Market Authorisation — parallel
trader/ARPU model with take-rate economics and treasury yield), consolidated with the shared
Gibraltar substance layer, group funding rounds and cash.

Based on the luckymay-model codebase (same engine, charts and defaults API).

- `index.html` — the app. Loads the latest saved assumption set from `/api/defaults` at boot
  (falls back to baked-in defaults); "Save current numbers as new default" POSTs new versions.
- `api/defaults.js` — Vercel serverless function backed by Vercel Blob.
- `middleware.js` — shared-password gate (change `PASSWORD` on line 2).

Deploys on Vercel. For saving defaults, link a Blob store (`BLOB_READ_WRITE_TOKEN`).
