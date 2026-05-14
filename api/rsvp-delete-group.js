// api/rsvp-delete-group.js
// DELETE /api/rsvp-delete-group  →  borra un grupo completo por envio_id
// Requiere header: Authorization: Bearer <PANEL_BEARER_TOKEN>

import { getPool } from '../lib/pg-pool.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!process.env.PANEL_BEARER_TOKEN) {
    return res.status(500).json({ error: 'PANEL_BEARER_TOKEN no configurado en Vercel.' });
  }
  if (token !== process.env.PANEL_BEARER_TOKEN) {
    return res.status(401).json({ error: 'Token incorrecto.' });
  }

  const envioId = String((req.body && req.body.envio_id) || '').trim();
  if (!envioId) {
    return res.status(400).json({ error: 'Falta envio_id.' });
  }

  try {
    const pool = getPool();
    const result = await pool.query('DELETE FROM rsvp_rows WHERE envio_id = $1', [envioId]);
    return res.status(200).json({ ok: true, deleted: result.rowCount || 0 });
  } catch (err) {
    console.error('[rsvp-delete-group] Error de base de datos:', err.message);
    return res.status(500).json({ error: 'Error de base de datos. Revisa los logs de Vercel.' });
  }
}
