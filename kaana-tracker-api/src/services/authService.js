import bcrypt from 'bcryptjs';
import { getPool } from '../db/index.js';
import { signToken } from '../middleware/auth.js';
import { verifyGoogleIdToken } from './googleAuthService.js';

/** Users created via Clerk before migration have no real password hash. */
const CLERK_PASSWORD_PLACEHOLDER = '$2a$10$clerk.nopassword.kaana.tracker.placeholder';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export async function registerUser(email, password, name) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Enter a valid email address' };
  }
  if (!password || String(password).length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const pool = getPool();
  const displayName = String(name || '').trim() || normalizedEmail.split('@')[0] || 'User';
  const hash = bcrypt.hashSync(String(password), 10);

  const [rows] = await pool.query(
    'SELECT id, name, email, password, name_customized FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail],
  );
  const existing = rows[0];

  if (existing) {
    if (existing.password && existing.password !== CLERK_PASSWORD_PLACEHOLDER) {
      return { error: 'An account with this email already exists. Sign in instead.' };
    }
    await pool.query(
      `UPDATE users SET password = ?,
        name = CASE WHEN name_customized = 1 THEN name ELSE ? END
      WHERE id = ?`,
      [hash, displayName, existing.id],
    );
    const user = { id: existing.id, name: existing.name_customized ? existing.name : displayName, email: normalizedEmail };
    return { token: signToken(user), user };
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [displayName, normalizedEmail, hash],
  );
  const user = { id: result.insertId, name: displayName, email: normalizedEmail };
  return { token: signToken(user), user };
}

export async function loginWithGoogle(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return { error: 'Google sign-in is not configured' };
  }
  if (!idToken) {
    return { error: 'Missing Google credential' };
  }

  try {
    const profile = await verifyGoogleIdToken(idToken, clientId);
    return upsertGoogleUser(profile.email, profile.name);
  } catch (err) {
    console.error('Google auth failed:', err?.message || err);
    return { error: 'Google sign-in failed. Try again or use email and password.' };
  }
}

async function upsertGoogleUser(email, name) {
  const normalizedEmail = normalizeEmail(email);
  const pool = getPool();
  const displayName = String(name || '').trim() || normalizedEmail.split('@')[0] || 'User';

  const [rows] = await pool.query(
    'SELECT id, name, email, name_customized FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail],
  );
  const existing = rows[0];

  if (existing) {
    if (!existing.name_customized && displayName && existing.name !== displayName) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [displayName, existing.id]);
    }
    const user = {
      id: existing.id,
      name: existing.name_customized ? existing.name : (displayName || existing.name),
      email: normalizedEmail,
    };
    return { token: signToken(user), user };
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [displayName, normalizedEmail, CLERK_PASSWORD_PLACEHOLDER],
  );
  const user = { id: result.insertId, name: displayName, email: normalizedEmail };
  return { token: signToken(user), user };
}

export async function loginUser(email, password) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
    [normalizeEmail(email)],
  );
  const user = rows[0];
  if (!user || user.password === CLERK_PASSWORD_PLACEHOLDER) {
    return { error: 'Invalid email or password' };
  }
  if (!bcrypt.compareSync(password, user.password)) {
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
    'SELECT id, name, email, clerk_user_id, name_customized, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

export async function updateUserProfile(userId, data) {
  const name = String(data.name || '').trim();
  if (!name) return { error: 'Name is required', status: 400 };
  if (name.length > 100) return { error: 'Name is too long (max 100 characters)', status: 400 };

  const pool = getPool();
  const [rows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!rows[0]) return { error: 'User not found', status: 404 };

  await pool.query(
    'UPDATE users SET name = ?, name_customized = 1 WHERE id = ?',
    [name, userId],
  );

  return getUserById(userId);
}
