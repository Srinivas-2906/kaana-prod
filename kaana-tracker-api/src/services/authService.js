import bcrypt from 'bcryptjs';
import { Webhook } from 'svix';
import { getPool } from '../db/index.js';
import { signToken } from '../middleware/auth.js';

const CLERK_PASSWORD_PLACEHOLDER = '$2a$10$clerk.nopassword.kaana.tracker.placeholder';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function extractEmailFromPayload(payload) {
  if (payload?.email) return normalizeEmail(payload.email);
  if (typeof payload?.primary_email_address === 'string') {
    return normalizeEmail(payload.primary_email_address);
  }
  return null;
}

function displayNameFromPayload(payload, email) {
  const parts = [payload?.first_name, payload?.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (payload?.name) return String(payload.name);
  if (email) return email.split('@')[0];
  return 'User';
}

export async function resolveClerkUser(clerkUserId, payload = {}) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, name, email FROM users WHERE clerk_user_id = ? LIMIT 1',
    [clerkUserId],
  );
  if (rows[0]) return rows[0];

  const email = extractEmailFromPayload(payload);
  if (email) {
    const [existing] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    if (existing[0]) {
      await pool.query('UPDATE users SET clerk_user_id = ? WHERE id = ?', [clerkUserId, existing[0].id]);
      return existing[0];
    }
  }

  const name = displayNameFromPayload(payload, email);
  const emailVal = email || `user-${clerkUserId.slice(-8)}@tracker.kaana.local`;
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, clerk_user_id) VALUES (?, ?, ?, ?)',
    [name, emailVal, CLERK_PASSWORD_PLACEHOLDER, clerkUserId],
  );
  return { id: result.insertId, name, email: emailVal };
}

export async function upsertClerkUser(clerkUserId, email, name) {
  const pool = getPool();
  const normalizedEmail = normalizeEmail(email);
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1',
    [clerkUserId],
  );
  if (existing[0]) return existing[0];

  if (normalizedEmail) {
    const [byEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail],
    );
    if (byEmail[0]) {
      await pool.query('UPDATE users SET clerk_user_id = ? WHERE id = ?', [clerkUserId, byEmail[0].id]);
      return byEmail[0];
    }
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, clerk_user_id) VALUES (?, ?, ?, ?)',
    [
      name || normalizedEmail?.split('@')[0] || 'User',
      normalizedEmail || `user-${clerkUserId.slice(-8)}@tracker.kaana.local`,
      CLERK_PASSWORD_PLACEHOLDER,
      clerkUserId,
    ],
  );
  return { id: result.insertId };
}

export async function deactivateClerkUser(clerkUserId) {
  const pool = getPool();
  await pool.query('UPDATE users SET clerk_user_id = NULL WHERE clerk_user_id = ?', [clerkUserId]);
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
    'SELECT id, name, email, clerk_user_id, created_at FROM users WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

export function handleClerkWebhook(req, res) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];
  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing webhook headers' });
  }

  const wh = new Webhook(webhookSecret);
  let payload;

  try {
    payload = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  handleClerkWebhookEvent(payload)
    .then(() => res.json({ received: true }))
    .catch((err) => {
      console.error('Clerk webhook error:', err);
      res.status(500).json({ error: 'Webhook processing failed' });
    });
}

async function handleClerkWebhookEvent(payload) {
  const eventType = payload.type;
  const data = payload.data || {};

  if (eventType === 'user.created') {
    const clerkUserId = data.id;
    const emailAddresses = data.email_addresses || [];
    const primaryId = data.primary_email_address_id;
    const email =
      emailAddresses.find((entry) => entry.id === primaryId)?.email_address
      || emailAddresses[0]?.email_address;
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
    await upsertClerkUser(clerkUserId, email, name);
    return;
  }

  if (eventType === 'user.updated') {
    const clerkUserId = data.id;
    const emailAddresses = data.email_addresses || [];
    const primaryId = data.primary_email_address_id;
    const email =
      emailAddresses.find((entry) => entry.id === primaryId)?.email_address
      || emailAddresses[0]?.email_address;
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ');
    if (email || name) {
      const pool = getPool();
      await pool.query(
        'UPDATE users SET email = COALESCE(?, email), name = COALESCE(?, name) WHERE clerk_user_id = ?',
        [email ? normalizeEmail(email) : null, name || null, clerkUserId],
      );
    }
    return;
  }

  if (eventType === 'user.deleted') {
    await deactivateClerkUser(data.id);
  }
}
