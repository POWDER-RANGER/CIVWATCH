import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { env } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(1024),
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.validatedBody as z.infer<typeof loginSchema>;
    if (!email || !password) throw new AppError(400, 'VALIDATION_ERROR', 'Email and password required');

    const rows = await pool.query<any>('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows.rows[0];
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
