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
  const uri = env === 'production' ? process.env.MONGO_URI_PROD : process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI/MONGO_URI_PROD não definidos no .env');
  }

  logger.info(`Ambiente: ${env}`);
  logger.info(`Conectando no MongoDB com URI: ${maskUri(uri)}`);

  await mongoose.connect(uri);
  currentMongoUri = uri;
  logger.info('MongoDB conectado com sucesso');
}
