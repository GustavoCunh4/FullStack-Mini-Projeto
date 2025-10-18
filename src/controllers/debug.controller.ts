import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { currentMongoUri, maskUri } from '../database/connection';

function readyStateToText(state: number) {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return String(state);
  }
}

export function dbInfo(_req: Request, res: Response) {
  const conn: any = mongoose.connection as any;
  const info = {
    env: process.env.NODE_ENV,
    selectedEnvVar: process.env.NODE_ENV === 'production' ? 'MONGO_URI_PROD' : 'MONGO_URI',
    uriMasked: currentMongoUri ? maskUri(currentMongoUri) : null,
    db: {
      name: conn?.name ?? null,
      host: conn?.host ?? null,
      port: conn?.port ?? null,
      readyState: readyStateToText(conn?.readyState ?? -1)
    }
  };

  return res.status(200).json(info);
}

