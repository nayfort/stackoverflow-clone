import 'server-only';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { getStore } from './db';
import { AppError } from './types';

const cookieName = 'community_session';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return getStore().session(hash(token));
}
export async function getViewer() {
  return (await currentUser())?.id ?? '';
}
export async function requireViewer() {
  const id = await getViewer();
  if (!id) throw new AppError('auth');
  return id;
}
export async function startSession(userId: string) {
  await endSession();
  const token = randomBytes(32).toString('hex');
  getStore().createSession(hash(token), userId);
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) getStore().deleteSession(hash(token));
  jar.delete(cookieName);
}
