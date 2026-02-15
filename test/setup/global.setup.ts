import { MongoDBContainer } from '@testcontainers/mongodb';
import type { StartedMongoDBContainer } from '@testcontainers/mongodb';
import { Wait } from 'testcontainers';

let mongoContainer: StartedMongoDBContainer | undefined;

export async function setup() {
  console.log('[GLOBAL SETUP] Starting MongoDB test container...');

  mongoContainer = await new MongoDBContainer('mongo:8')
    .withExposedPorts(27017)
    .withStartupTimeout(180_000)
    .withWaitStrategy(
      Wait.forLogMessage(
        /Waiting for connections|waiting for connections/i,
        1,
      ).withStartupTimeout(180_000),
    )
    .start();

  const host = mongoContainer.getHost(); // usually "localhost"
  const port = mongoContainer.getMappedPort(27017); // the random host port

  const uri = `mongodb://${host}:${port}?directConnection=true`;

  process.env.MONGO_URI = uri;
  process.env.DATABASE_NAME = 'shop-test';

  console.log(
    '[GLOBAL SETUP] MongoDB container started →',
    process.env.MONGO_URI,
  );
}

export async function teardown() {
  if (mongoContainer) {
    console.log('[GLOBAL SETUP] Stopping MongoDB container...');
    await mongoContainer.stop();
    console.log('[GLOBAL SETUP] MongoDB container stopped');
  }
}
