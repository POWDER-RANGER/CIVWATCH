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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'Bearer token required' } });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
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
