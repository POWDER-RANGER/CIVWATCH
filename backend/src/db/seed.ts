/**
 * Development seed — creates a default admin user.
 * Run: npx ts-node src/db/seed.ts
 */
import { pool } from '.';
import bcrypt from 'bcrypt';

async function seed() {
  const hash = await bcrypt.hash('civwatch-dev-password', 12);
  await pool.query(
    `INSERT INTO users (email, password, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['admin@civwatch.local', hash]
  );
  console.log('\u2705 Seed complete. Admin: admin@civwatch.local');
  await pool.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
