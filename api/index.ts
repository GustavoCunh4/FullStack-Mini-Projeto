import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../src/app';
import { connectDB } from '../src/database/connection';

let conn: Promise<void> | null = null;
if (!conn) conn = connectDB();

const handler = serverless(app);

export default async (event: any, context: any) => {
  if (conn) await conn;
  return handler(event, context);
};

