import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../src/app';
import { connectDB } from '../src/database/connection';

let conn: Promise<void> | null = null;
if (!conn) conn = connectDB();

export default serverless(app);
