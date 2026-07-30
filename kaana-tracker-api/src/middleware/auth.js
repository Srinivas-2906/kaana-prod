import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tracker-dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || JWT_SECRET === 'tracker-dev-secret-change-me') {
    throw new Error('JWT_SECRET is required in production');
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
