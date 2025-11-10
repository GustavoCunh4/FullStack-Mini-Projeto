import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../src/app';
import { connectDB } from '../src/database/connection';

let conn: Promise<void> | null = null;

const handler = serverless(app);

export default async (event: any, context: any) => {
  // Log basico para entender como o Vercel esta encaminhando a requisicao
  console.log('lambda:event', {
    path: event?.path,
    rawUrl: event?.rawUrl,
    method: event?.httpMethod,
    routeKey: event?.routeKey
  });

  const rawUrl = event?.rawUrl as string | undefined;
  const path = event?.path as string | undefined;

  if (path === '/healthz' || rawUrl?.endsWith('/healthz')) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, env: process.env.NODE_ENV })
    };
  }

  if (!conn) conn = connectDB();
  try {
    await conn;
  } catch (err: any) {
    conn = null;
    return {
      statusCode: 503,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: 'Falha ao conectar ao banco',
        detail: err?.message || String(err)
      })
    };
  }

  return handler(event, context);
};
