// api/rsvp-rows.js
// GET /api/rsvp-rows  →  devuelve todas las filas de rsvp_rows
// Requiere header: Authorization: Bearer <PANEL_BEARER_TOKEN>

import { getPool } from '../lib/pg-pool.js';

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // ── Autenticación ────────────────────────────────────────────────────────
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();

  if (!process.env.PANEL_BEARER_TOKEN) {
    return res.status(500).json({ error: 'PANEL_BEARER_TOKEN no configurado en Vercel.' });
  }
  if (token !== process.env.PANEL_BEARER_TOKEN) {
    return res.status(401).json({ error: 'Token incorrecto.' });
  }

  // ── Consulta ─────────────────────────────────────────────────────────────
  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT
        id,
        created_at,
        envio_id,
        tipo_persona,
        invitado_principal,
        nombre,
        email,
        telefono,
        asistencia,
        num_acompanantes,
        nombres_acompanantes,
        alergia,
        alergias_detalle,
        transporte,
        transporte_detalle
      FROM rsvp_rows
      ORDER BY created_at DESC
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('[rsvp-rows] Error de base de datos:', err.message);
    return res.status(500).json({ error: 'Error de base de datos. Revisa los logs de Vercel.' });
  }
}