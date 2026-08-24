import { getStore } from '@netlify/blobs';

// Stockage partagé pour la synchronisation multi-appareils.
// GET  /.netlify/functions/sync?code=XXX     -> renvoie l'enregistrement { data, rev, updatedAt } ou null
// POST /.netlify/functions/sync  { code, data, rev } -> enregistre si rev >= rev existant, sinon renvoie l'existant

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// Normalise le code famille en une clé de stockage sûre
const keyFor = (code) =>
  'family_' + String(code).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 64);

export default async (req) => {
  const store = getStore('tribu-sync');

  if (req.method === 'GET') {
    const code = new URL(req.url).searchParams.get('code');
    if (!code) return json({ error: 'code requis' }, 400);
    const record = await store.get(keyFor(code), { type: 'json' });
    return json(record || null);
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'corps JSON invalide' }, 400);
    }
    const { code, data, rev } = body || {};
    if (!code) return json({ error: 'code requis' }, 400);

    const key = keyFor(code);
    const existing = await store.get(key, { type: 'json' });
    // Conflit : la version distante est plus récente -> on la renvoie sans écraser
    if (existing && Number(existing.rev) > Number(rev)) {
      return json(existing);
    }
    const record = { data, rev: Number(rev) || 0, updatedAt: Date.now() };
    await store.setJSON(key, record);
    return json(record);
  }

  return json({ error: 'méthode non supportée' }, 405);
};
