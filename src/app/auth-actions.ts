'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getStore } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { validateCredentials } from '@/lib/auth-validation';
import { startSession, endSession } from '@/lib/session';
import { AppError, type ActionState } from '@/lib/types';

async function authenticate(form: FormData, registration: boolean): Promise<ActionState> {
  try {
    const store = getStore();
    store.consumeLimit('authentication', 'global', 100);
    const data = validateCredentials(
      form.get('email'),
      form.get('password'),
      registration ? form.get('username') : undefined,
    );
    const key = createHash('sha256').update(data.email).digest('hex');
    store.consumeLimit(key, 'authentication', 10);
    let id: string;
    if (registration) {
      const user = store.createUser(data.username, data.email, await hashPassword(data.password));
      id = user.id;
    } else {
      const user = store.credentials(data.email);
      const valid = await verifyPassword(data.password, user?.password ?? '');
      if (!valid || !user) throw new AppError('credentials');
      id = user.id;
    }
    await startSession(id);
  } catch (error) {
    if (error instanceof AppError) return { error: error.code };
    console.error('Authentication operation failed');
    return { error: 'server' };
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
export async function register(_state: ActionState, form: FormData) {
  return authenticate(form, true);
}
export async function login(_state: ActionState, form: FormData) {
  return authenticate(form, false);
}
export async function logout() {
  await endSession();
  revalidatePath('/', 'layout');
  redirect('/');
}
