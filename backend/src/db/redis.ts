import { createClient } from 'redis';
import { env } from '../config/env';

export const redis = createClient({ url: env.REDIS_URL });

redis.on('error', (err) => console.error('Redis client error', err));

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
    console.log('✅ Redis connected');
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  return val ? (JSON.parse(val) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}
