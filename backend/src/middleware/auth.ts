import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verify JWT token with explicit algorithm whitelist.
 * Prevents algorithm confusion attacks (CVE-2015-9235 / A07:2021).
 * REF: NIST 800-53 IA-2, IA-5
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'Bearer token required' } });
  }
  const token = header.slice(7);
  try {
    // Explicit algorithm prevents RS256->HS256 substitution attacks
    req.user = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 30, // 30s leeway for clock skew
    }) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Invalid or expired token' } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'AUTHORIZATION_ERROR', message: 'Insufficient permissions' } });
    }
    next();
  };
}
