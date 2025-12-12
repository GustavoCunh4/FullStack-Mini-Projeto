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
    await mongoose.connect(uri, {
      // Força IPv4; Atlas free/shared costuma liberar apenas IPv4 na allowlist
      family: 4,
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 5000)
    });
    currentMongoUri = uri;
    logger.info('MongoDB conectado com sucesso');
  } catch (err: any) {
    logger.error(`Falha ao conectar no MongoDB: ${err?.message || err}`);
    throw err;
  }
}
