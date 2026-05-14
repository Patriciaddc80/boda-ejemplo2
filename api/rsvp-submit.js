// api/rsvp-submit.js
// POST /api/rsvp-submit  →  inserta una o varias filas en rsvp_rows
// Body JSON: { rows: [ { ...campos }, ... ] }
// Evita errores por duplicados; si existe índice único, descartará repetidos.

import { getPool } from '../lib/pg-pool.js';

export default async function handler(req, res) {
  // ── CORS ────────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Validación del body ──────────────────────────────────────────────────
  const { rows } = req.body || {};

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'El body debe ser { rows: [...] } con al menos un elemento.' });
  }

  if (rows.length > 15) {
    return res.status(400).json({ error: 'Demasiadas filas en una sola petición.' });
  }

  // ── Inserción ────────────────────────────────────────────────────────────
  try {
    const pool = getPool();
    let insertados = 0;

    for (const row of rows) {
      // Sanitización básica
      const createdAt = row.created_at || new Date().toISOString();
      const envioId = String(row.envio_id || createdAt).slice(0, 100);
      const tipoPersona = row.tipo_persona === 'acompanante' ? 'acompanante' : 'invitado';
      const invitadoPrincipal = row.invitado_principal ?? null;
      const nombre = String(row.nombre || '').slice(0, 200);
      const email = String(row.email || '').slice(0, 200);
      const telefono = row.telefono ?? null;
      const asistencia = row.asistencia ?? null;
      const numAcompanantes = Number.isInteger(row.num_acompanantes) ? row.num_acompanantes : null;
      const nombresAcompanantes = Array.isArray(row.nombres_acompanantes)
        ? JSON.stringify(row.nombres_acompanantes)
        : null;
      const alergia = row.alergia ?? null;
      const alergiasDetalle = row.alergias_detalle ?? null;
      const transporte = row.transporte ?? null;
      const transporteDetalle = row.transporte_detalle ?? null;

      // Si hay constraint único (envio_id, nombre), evitará duplicados.
      // Sin constraint, no fallará y seguirá insertando.
      await pool.query(
        `INSERT INTO rsvp_rows (
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
        ) VALUES (
          $1::timestamptz, $2, $3, $4, $5, $6, $7, $8, $9,
          $10::jsonb,
          $11, $12, $13, $14
        )
        ON CONFLICT DO NOTHING`,
        [
          createdAt,
          envioId,
          tipoPersona,
          invitadoPrincipal,
          nombre,
          email,
          telefono,
          asistencia,
          numAcompanantes,
          nombresAcompanantes,
          alergia,
          alergiasDetalle,
          transporte,
          transporteDetalle,
        ]
      );

      insertados++;
    }

    return res.status(200).json({ ok: true, insertados });
  } catch (err) {
    console.error('[rsvp-submit] Error de base de datos:', err.message);
    return res.status(500).json({ error: 'Error de base de datos. Revisa los logs de Vercel.' });
  }
}