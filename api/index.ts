import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../src/app';
import { connectDB } from '../src/database/connection';

// Inicie a conexão de forma preguiçosa e compartilhe entre invocações
let conn: Promise<void> | null = null;

const handler = serverless(app);

export default async (event: any, context: any) => {
  // Health check rápido que não depende do banco (evita timeout e ajuda a diagnosticar roteamento)
  if (event?.path === '/healthz' || event?.rawUrl?.endsWith('/healthz')) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, env: process.env.NODE_ENV })
    };
  }

  // Conecta no banco somente quando necessário
  if (!conn) conn = connectDB();
  await conn;

  return handler(event, context);
};
