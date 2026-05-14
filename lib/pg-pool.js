import pkg from 'pg';

const { Pool } = pkg;

let pool;

export function getPool() {
  if (!pool) {
   var url = process.env.POSTGRES_DATABASE_URL;
if (!url) throw new Error('POSTGRES_DATABASE_URL is not set');
    pool = new Pool({ connectionString: url, max: 4 });
  }
  return pool;
}