import { Request, Response, NextFunction } from 'express';

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

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code       = err instanceof AppError ? err.code       : 'INTERNAL_ERROR';
  const details    = err instanceof AppError ? err.details    : undefined;

  if (statusCode >= 500) console.error('[error]', err);

  res.status(statusCode).json({
    error: {
      code,
      message: err.message,
      details,
      requestId: (req as any).id,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
}
