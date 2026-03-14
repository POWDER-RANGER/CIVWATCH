/**
 * Lightweight migration runner — runs SQL files in order on startup.
 * For production scale, replace with node-pg-migrate or Flyway.
 */
import { pool } from '.';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export async function runMigrations(): Promise<void> {
  // Ensure migrations tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const applied = await pool.query<{ filename: string }>(
    'SELECT filename FROM _migrations ORDER BY id'
  );
  const appliedSet = new Set(applied.rows.map((r) => r.filename));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`\u23f3  Applying migration: ${file}`);
    await pool.query(sql);
    await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
    console.log(`\u2705  Applied: ${file}`);
  }
}
