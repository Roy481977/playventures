// Rain Gibraltar — model defaults API (Vercel Blob storage)
// GET  /api/defaults        -> latest saved assumption set (404 if none yet)
// GET  /api/defaults?list=1 -> version history (pathnames + timestamps)
// POST /api/defaults        -> save new default (writes latest + timestamped version)
import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (req.query && req.query.list) {
        const { blobs } = await list({ prefix: 'defaults/v-' });
        return res.status(200).json(blobs.map(b => ({ path: b.pathname, uploadedAt: b.uploadedAt, size: b.size }))
          .sort((a, b) => (a.path < b.path ? 1 : -1)));
      }
      const { blobs } = await list({ prefix: 'defaults/v-' });
      if (!blobs.length) return res.status(404).json({ error: 'no defaults saved yet' });
      blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest version first (ISO timestamps sort)
      const r = await fetch(blobs[0].url, { cache: 'no-store' });
      const j = await r.json();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(j);
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || !body.meta || !body.geos || !body.games || !body.personnel)
        return res.status(400).json({ error: 'not a valid assumptions object' });
      const json = JSON.stringify(body, null, 2);
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      await put('defaults/v-' + ts + '.json', json, { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
      await put('defaults/latest.json', json, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
      return res.status(200).json({ ok: true, version: 'v-' + ts });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
