import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import logger from './logger.ts';

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => logger.error('Redis Client Error', err));

let isReady = false;

export async function connectRedis() {
  if (!isReady) {
    await client.connect();
    isReady = true;
    logger.info('Redis connected');
  }
  return client;
}

export default client;
