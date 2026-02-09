import mongoose from 'mongoose';
import type { ConnectOptions } from 'mongoose';

/* ============================
   Environment typing
============================ */

interface MongoEnvConfig {
  protocol: string;
  host: string;
  port?: string;
  databaseName: string;
  username?: string;
  password?: string;
}

/* ============================
   Mongo Connection Class
============================ */

class MongoConnection {
  private uri: string;
  private options: ConnectOptions;

  constructor(options: ConnectOptions = {}) {
    const config = this.loadEnv();
    this.uri = this.buildUri(config);
    this.options = options;
    this.registerProcessHandlers();
  }

  /* ============================
     Public API
  ============================ */

  async connect(): Promise<void> {
    if (this.isConnected()) {
      console.log('✅ MongoDB already connected');
      return;
    }

    try {
      await mongoose.connect(this.uri, this.options);
      console.log('✔ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected()) return;

    await mongoose.disconnect();
    console.log('❎ MongoDB disconnected');
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  isConnecting(): boolean {
    return mongoose.connection.readyState === 2;
  }

  isDisconnected(): boolean {
    return mongoose.connection.readyState === 0;
  }

  getReadyState(): number {
    return mongoose.connection.readyState;
  }

  getReadyStateLabel():
    | 'disconnected'
    | 'connected'
    | 'connecting'
    | 'disconnecting' {
    switch (mongoose.connection.readyState) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'disconnected';
    }
  }

  /* ============================
     Private helpers
  ============================ */

  private loadEnv(): MongoEnvConfig {
    const {
      MONGO_PROTOCOL,
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_HOST,
      MONGO_PORT,
      MONGO_DATABASE_NAME,
    } = process.env;

    if (!MONGO_PROTOCOL) throw new Error('🛑 MONGO_PROTOCOL is missing');
    if (!MONGO_HOST) throw new Error('🛑 MONGO_HOST is missing');
    if (!MONGO_DATABASE_NAME)
      throw new Error('🛑 MONGO_DATABASE_NAME is missing');

    return {
      protocol: MONGO_PROTOCOL,
      host: MONGO_HOST,
      port: MONGO_PORT,
      databaseName: MONGO_DATABASE_NAME,
      username: MONGO_USERNAME,
      password: MONGO_PASSWORD,
    };
  }

  private buildUri(config: MongoEnvConfig): string {
    const hasAuth = config.username && config.password;

    return hasAuth
      ? `${config.protocol}://${encodeURIComponent(
          config.username!,
        )}:${encodeURIComponent(config.password!)}@${config.host}${
          config.port ? `:${config.port}` : ''
        }/${config.databaseName}`
      : `${config.protocol}://${config.host}${
          config.port ? `:${config.port}` : ''
        }/${config.databaseName}`;
  }

  private registerProcessHandlers(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`⛔ Received ${signal}. Closing MongoDB connection...`);
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown); // nodemon
  }
}

/* ============================
   Export singleton instance
============================ */

export default new MongoConnection();
