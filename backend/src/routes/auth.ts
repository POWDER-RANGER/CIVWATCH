import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/** POST /api/auth/login */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email and password are required' } });
    return;
  }

  const { rows } = await pool.query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  const user = rows[0];
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    return;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRATION ?? '24h' }
  );

  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

/** GET /api/auth/me */
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
