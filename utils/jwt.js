import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1d',
  });
}

export function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('[JWT] Warning: JWT_SECRET is not defined in environment. Using fallback.');
    }
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (error) {
    console.error('[JWT] Verification failed:', error.message);
    return null;
  }
}
