import mysql from 'mysql2/promise';

let pool = null;

function buildConfig() {
  const socket = process.env.DB_SOCKET;
  if (socket) {
    return {
      socketPath: socket,
      user: process.env.DB_USER || 'tracker',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'expense_tracker',
      waitForConnections: true,
      connectionLimit: 10,
    };
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'expense_tracker',
    waitForConnections: true,
    connectionLimit: 10,
  };
}

export async function initDatabase() {
  if (pool) return pool;
  pool = mysql.createPool(buildConfig());
  await pool.query('SELECT 1');
  console.log('MySQL connected:', process.env.DB_NAME);
  return pool;
}

export function getPool() {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}
