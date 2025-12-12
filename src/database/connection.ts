import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export function maskUri(uri: string) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '****';
    return u.toString();
  } catch {
    return uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
  }
}

export let currentMongoUri: string | null = null;

export async function connectDB() {
  const env = process.env.NODE_ENV;
  const uri =
    env === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI/MONGO_URI_PROD nao definidos no .env');
  }

  logger.info(`Ambiente: ${env}`);
  logger.info(`Conectando no MongoDB com URI: ${maskUri(uri)}`);

  try {
    const timeoutMs = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 8000);

    const connectPromise = mongoose.connect(uri, {
      // Força IPv4; Atlas free/shared costuma liberar apenas IPv4
      family: 4,
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000),
      connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 10000)
    });

    // Garante que não ficamos pendurados (Vercel derruba em 300s; aqui abortamos em ~8s)
    await Promise.race([
      connectPromise,
      new Promise((_resolve, reject) =>
        setTimeout(
          () => reject(new Error(`Mongo connect timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);

    currentMongoUri = uri;
    logger.info('MongoDB conectado com sucesso');
  } catch (err: any) {
    logger.error(`Falha ao conectar no MongoDB: ${err?.message || err}`);
    throw err;
  }
}
