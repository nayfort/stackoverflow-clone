import { AppError } from './types';
export function validateCredentials(email: unknown, password: unknown, username?: unknown) {
  if (
    typeof email !== 'string' ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    throw new AppError('email');
  if (typeof password !== 'string' || password.length < 10 || password.length > 128)
    throw new AppError('password');
  if (
    username !== undefined &&
    (typeof username !== 'string' || !/^[\p{L}\p{N}_-]{3,30}$/u.test(username.trim()))
  )
    throw new AppError('username');
  return {
    email: email.trim().toLowerCase(),
    password,
    username: typeof username === 'string' ? username.trim() : '',
  };
}
