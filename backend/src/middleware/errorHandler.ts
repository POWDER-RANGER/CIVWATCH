import { Request, Response, NextFunction } from 'express';

const IS_DEV = process.env.NODE_ENV === 'development';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(details: any) { super(400, 'VALIDATION_ERROR', 'Validation failed', details); }
}
export class NotFoundError extends AppError {
  constructor(resource: string) { super(404, 'NOT_FOUND', `${resource} not found`); }
}
export class AuthError extends AppError {
  constructor(msg = 'Authentication required') { super(401, 'AUTHENTICATION_ERROR', msg); }
}

/**
 * Global error handler.
 * Sanitizes details in production to prevent information leakage (OWASP A05:2021).
 * REF: NIST 800-53 SI-11 (Error Handling)
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code       = err instanceof AppError ? err.code       : 'INTERNAL_ERROR';
  const rawDetails = err instanceof AppError ? err.details    : undefined;

  // Log full error server-side for debugging (never send to client)
  if (statusCode >= 500) {
    console.error('[error]', {
      code,
      message: err.message,
      path: req.path,
      requestId: (req as any).id,
      // Include stack in dev only
      ...(IS_DEV && { stack: err.stack }),
    });
  }

  // In production, sanitize details to prevent information leakage
  // Only include details for 4xx client errors (validation hints are OK)
  // Never include details for 5xx errors (may contain internal state)
  const safeDetails = IS_DEV
    ? rawDetails
    : (statusCode < 500 ? rawDetails : undefined);

  res.status(statusCode).json({
    error: {
      code,
      message: err.message,
      details: safeDetails,
      requestId: (req as any).id,
      timestamp: new Date().toISOString(),
      path: req.path,
      // Stack traces ONLY in development
      ...(IS_DEV && statusCode >= 500 && { stack: err.stack }),
    },
  });
}
