// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const SALT_ROUNDS = 10;

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err: any = new Error('E-mail já cadastrado');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashed });

  // Use o getter string "id" do Mongoose (evita o problema do _id: unknown)
  return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err: any = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err: any = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido no .env');
  }

  // Mantemos string '1h' normalmente — jsonwebtoken aceita string | number
  const expiresIn = process.env.JWT_EXPIRES || '1h';

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn }
  );

  return { token };
}
