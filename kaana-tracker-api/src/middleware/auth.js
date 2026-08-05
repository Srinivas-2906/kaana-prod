import jwt from 'jsonwebtoken';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { resolveClerkUser } from '../services/authService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tracker-dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';

if (process.env.NODE_ENV === 'production') {
  const hasClerk = Boolean(CLERK_SECRET_KEY);
  const hasJwt = Boolean(process.env.JWT_SECRET) && JWT_SECRET !== 'tracker-dev-secret-change-me';
  if (!hasClerk && !hasJwt) {
    throw new Error('CLERK_SECRET_KEY or JWT_SECRET is required in production');
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

export function verifyLegacyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function clerkAuthEnabled() {
  return Boolean(CLERK_SECRET_KEY);
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  if (CLERK_SECRET_KEY) {
    try {
      const payload = await verifyClerkToken(token, { secretKey: CLERK_SECRET_KEY });
      const user = await resolveClerkUser(payload.sub, payload);
      req.user = {
        sub: user.id,
        email: user.email,
        name: user.name,
        clerkUserId: payload.sub,
        authProvider: 'clerk',
      };
      return next();
    } catch {
      // Fall through to legacy JWT during dual-auth migration.
    }
  }

  try {
    const legacy = verifyLegacyToken(token);
    req.user = { ...legacy, authProvider: 'legacy' };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
