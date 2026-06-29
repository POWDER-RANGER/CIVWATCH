import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db';
import { env } from '../config/env';
import logger from '../utils/logger';
import { refresh_attempts_total, refresh_failures_total, refresh_revocations_total } from '../metrics/instrumentation';

export class TokenService {
  private static readonly ACCESS_EXP = '15m';
  private static readonly REFRESH_DAYS = 7; // days

  static generateAccessToken(user: any) {
    return jwt.sign({ userId: user.id, roles: user.roles }, env.JWT_PRIVATE_KEY as string, { algorithm: 'RS256', expiresIn: this.ACCESS_EXP });
  }

  static async generateAndStoreRefreshToken(userId: string, deviceInfo: any = {}) {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info) VALUES ($1, $2, NOW() + INTERVAL '${this.REFRESH_DAYS} days', $3)`,
      [userId, hash, deviceInfo]
    );
    return raw;
  }

  static async verifyRefreshToken(rawToken: string) {
    refresh_attempts_total.inc();
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const { rows } = await pool.query(`SELECT * FROM refresh_tokens WHERE token_hash = $1`, [hash]);
    const row = rows[0];
    if (!row) {
      refresh_failures_total.inc();
      // Potential reuse detection: look for recent revoked tokens for same user (best-effort)
      const suspect = await pool.query(`SELECT * FROM refresh_tokens WHERE token_hash = $1 OR (user_id IS NOT NULL AND revoked = TRUE AND updated_at > NOW() - INTERVAL '1 minute') LIMIT 1`, [hash]);
      if (suspect.rows[0]) {
        logger.warn('Possible refresh token reuse detected', { suspect: suspect.rows[0] });
      }
      throw new Error('Invalid refresh token');
    }

    if (row.revoked || new Date(row.expires_at) <= new Date()) {
      refresh_failures_total.inc();
      throw new Error('Refresh token expired or revoked');
    }

    return row;
  }

  static async revokeRefreshToken(rawToken: string) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await pool.query(`UPDATE refresh_tokens SET revoked = TRUE, updated_at = NOW() WHERE token_hash = $1`, [hash]);
    refresh_revocations_total.inc();
  }

  static async rotateRefreshToken(rawOld: string, userId: string, deviceInfo: any = {}) {
    // Revoke old, create new
    try {
      await this.revokeRefreshToken(rawOld);
    } catch (e) {
      logger.warn('Error revoking old refresh token during rotation', { err: e });
    }
    const newToken = await this.generateAndStoreRefreshToken(userId, deviceInfo);
    return newToken;
  }

  static async revokeAllForUser(userId: string) {
    await pool.query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [userId]);
    refresh_revocations_total.inc();
  }
}

export default TokenService;
