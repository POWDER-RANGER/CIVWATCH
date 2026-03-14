/**
 * CIVWATCH — Development Seed Script
 * Creates a default admin user and sample RSS source.
 * Usage: npx ts-node src/db/seed.ts
 */
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    // Admin user
    const passwordHash = await bcrypt.hash('Admin1234!', 12);
    const { rows: [user] } = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
      RETURNING id, email, role
    `, ['admin@civwatch.local', passwordHash]);
    console.log('✅ Admin user:', user.email, '| id:', user.id);

    // Sample RSS source
    const { rows: [source] } = await client.query(`
      INSERT INTO sources (user_id, name, type, url)
      VALUES ($1, 'Reuters Top News', 'rss', 'https://feeds.reuters.com/reuters/topNews')
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `, [user.id]);
    if (source) console.log('✅ Sample source:', source.name, '| id:', source.id);

    // Sample alert rule
    await client.query(`
      INSERT INTO alert_rules (user_id, name, rule_type, threshold, operator, source_id, notification_url)
      VALUES ($1, 'Negative Sentiment Alert', 'avg_sentiment', -0.3, 'lt', $2, '')
      ON CONFLICT DO NOTHING
    `, [user.id, source?.id ?? null]);
    console.log('✅ Sample alert rule created.');

    console.log('\n✅ Seed complete. Login: admin@civwatch.local / Admin1234!');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
