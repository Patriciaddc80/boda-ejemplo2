-- PostgreSQL (Neon, Supabase, Vercel Postgres, etc.)
-- Ejecutar una vez en el panel SQL de tu proveedor.

CREATE TABLE IF NOT EXISTS rsvp_rows (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  envio_id TEXT,
  tipo_persona TEXT NOT NULL DEFAULT 'invitado',
  invitado_principal TEXT,
  nombre TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefono TEXT,
  asistencia TEXT,
  num_acompanantes INT,
  nombres_acompanantes JSONB,
  alergia TEXT,
  alergias_detalle TEXT,
  transporte TEXT,
  transporte_detalle TEXT
);

CREATE INDEX IF NOT EXISTS idx_rsvp_rows_created ON rsvp_rows (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_rows_envio ON rsvp_rows (envio_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_rsvp_rows_envio_nombre ON rsvp_rows (envio_id, nombre);
