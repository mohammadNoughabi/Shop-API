import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));

let isReady = false;

export async function connectRedis() {
  if (!isReady) {
    await client.connect();
    isReady = true;
    console.log('Redis connected');
  }
  return client;
}

export default client;
