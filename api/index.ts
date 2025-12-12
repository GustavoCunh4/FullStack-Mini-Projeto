import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';
import { connectDB } from '../src/database/connection';

let conn: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check curto: não toca no banco
  if (req.url === '/healthz' || req.url?.endsWith('/healthz')) {
    return res
      .status(200)
      .json({ ok: true, env: process.env.NODE_ENV || 'undefined' });
  }

  if (!conn) conn = connectDB();
  try {
    await conn;
  } catch (err: any) {
    conn = null;
    return res.status(503).json({
      error: 'Falha ao conectar ao banco',
      detail: err?.message || String(err)
    });
  }

  // Express app é uma função (req,res,next); pode ser chamada diretamente
  return (app as any)(req, res);
}
