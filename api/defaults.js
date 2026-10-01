// Model defaults API (Vercel Blob storage) — one store, two plans kept apart.
// GET  /api/defaults?plan=main|luckyrain        -> latest saved assumption set (404 if none yet)
// GET  /api/defaults?plan=...&list=1            -> version history
// POST /api/defaults?plan=main|luckyrain        -> save new default (timestamped version; history kept)
import { put, list } from '@vercel/blob';

// Own folders inside the store, so a store shared with other apps never mixes their saved numbers.
const PREFIX = { main: 'playventures/main/v-', luckyrain: 'playventures/luckyrain/v-' };

export default async function handler(req, res) {
  try {
    const plan = (req.query && req.query.plan) || 'main';
    const prefix = PREFIX[plan];
    if (!prefix) return res.status(400).json({ error: 'unknown plan' });
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix });
      blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest first (ISO timestamps sort)
      if (req.query && req.query.list)
        return res.status(200).json(blobs.map(b => ({ path: b.pathname, uploadedAt: b.uploadedAt, size: b.size })));
      if (!blobs.length) return res.status(404).json({ error: 'no defaults saved yet' });
      const r = await fetch(blobs[0].url, { cache: 'no-store' });
      return res.status(200).json(await r.json());
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || !body.meta || !body.geos || !body.games || !body.personnel)
        return res.status(400).json({ error: 'not a valid assumptions object' });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      await put(prefix + ts + '.json', JSON.stringify(body, null, 2),
        { access: 'public', addRandomSuffix: true, contentType: 'application/json' });
      return res.status(200).json({ ok: true, version: ts });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
