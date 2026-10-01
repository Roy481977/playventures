// Model defaults API (Vercel Blob) — one store, each plan in its own folder.
// GET  /api/defaults?plan=main|luckyrain          -> latest saved assumption set (404 if none yet)
// GET  /api/defaults?plan=...&list=1              -> version history
// GET  /api/defaults?diag=1                       -> which storage settings are present (names only, never values)
// POST /api/defaults?plan=main|luckyrain          -> save new default (timestamped version; history kept)
// Works with both connection styles: BLOB_STORE_ID + automatic Vercel login (new) or BLOB_READ_WRITE_TOKEN (classic),
// and with both public and private stores.
import { put, list, get } from '@vercel/blob';

// Own folders inside the store, so a store shared with other apps never mixes their saved numbers.
const PREFIX = { main: 'playventures/main/v-', luckyrain: 'playventures/luckyrain/v-' };

async function readText(pathname, access) {
  const r = await get(pathname, { access, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return await new Response(r.stream).text();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET' && req.query && req.query.diag) {
      return res.status(200).json({
        BLOB_STORE_ID: !!process.env.BLOB_STORE_ID,
        BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
        VERCEL_OIDC_TOKEN: !!process.env.VERCEL_OIDC_TOKEN,
      });
    }
    const plan = (req.query && req.query.plan) || 'main';
    const prefix = PREFIX[plan];
    if (!prefix) return res.status(400).json({ error: 'unknown plan' });

    if (req.method === 'GET') {
      const { blobs } = await list({ prefix });
      blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest first (ISO timestamps sort)
      if (req.query && req.query.list)
        return res.status(200).json(blobs.map(b => ({ path: b.pathname, uploadedAt: b.uploadedAt, size: b.size })));
      if (!blobs.length) return res.status(404).json({ error: 'no defaults saved yet' });
      let text = null;
      for (const access of ['private', 'public']) {
        try { text = await readText(blobs[0].pathname, access); if (text) break; } catch (e) { /* try the other mode */ }
      }
      if (!text) return res.status(500).json({ error: 'could not read the latest saved version' });
      return res.status(200).json(JSON.parse(text));
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || !body.meta || !body.geos || !body.games || !body.personnel)
        return res.status(400).json({ error: 'not a valid assumptions object' });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const json = JSON.stringify(body, null, 2);
      let lastErr = null;
      for (const access of ['private', 'public']) {          // store type decides which one is accepted
        try {
          await put(prefix + ts + '.json', json, { access, addRandomSuffix: true, contentType: 'application/json' });
          return res.status(200).json({ ok: true, version: ts, access });
        } catch (e) { lastErr = e; }
      }
      throw lastErr;
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
