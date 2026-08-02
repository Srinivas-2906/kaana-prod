import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required (e.g. postgres://botiq:botiq_dev@localhost:5433/botiq)');
    }
    pool = new Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX) || 10,
    });
  }
  return pool;
}

/** Convert SQLite-style ? placeholders to Postgres $1, $2, … */
export function toPgSql(sql) {
  let index = 0;
  return sql
    .replace(/\?/g, () => `$${++index}`)
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/INSERT OR IGNORE/gi, 'INSERT')
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
}

export async function query(sql, params = []) {
  return getPool().query(toPgSql(sql), params);
}

export async function getOne(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0] ?? null;
}

export async function getAll(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows;
}

export async function run(sql, params = []) {
  let text = toPgSql(sql);
  const isInsert = /^\s*INSERT/i.test(text) && !/RETURNING/i.test(text);
  if (isInsert) {
    text = `${text.trim().replace(/;?\s*$/, '')} RETURNING id`;
  }
  const result = await getPool().query(text, params);
  return {
    changes: result.rowCount ?? 0,
    lastInsertRowid: result.rows[0]?.id ?? null,
  };
}

export async function exec(sql) {
  await getPool().query(sql);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
