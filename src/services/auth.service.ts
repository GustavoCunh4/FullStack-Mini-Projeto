import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const SALT_ROUNDS = 10;

type HttpError = Error & { status?: number };

function httpError(message: string, status: number): HttpError {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
}

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw httpError('Email ja cadastrado', 409);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashed });

  return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw httpError('Credenciais invalidas', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw httpError('Credenciais invalidas', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET nao definido no .env');
  }

  const expiresIn = process.env.JWT_EXPIRES || '1h';

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn }
  );

  return { token };
}
