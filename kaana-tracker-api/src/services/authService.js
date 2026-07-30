import bcrypt from 'bcryptjs';
import { getPool } from '../db/index.js';
import { signToken } from '../middleware/auth.js';

export async function loginUser(email, password) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
    [String(email || '').trim().toLowerCase()],
  );
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return { error: 'Invalid email or password' };
  }
  return {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function getUserById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}
