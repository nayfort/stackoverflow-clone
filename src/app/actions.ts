'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getStore } from '@/lib/db';
import { requireViewer } from '@/lib/session';
import { AppError, type ActionState } from '@/lib/types';

function fields(form: FormData) {
  return { title: form.get('title'), body: form.get('body'), tags: form.get('tags') };
}
function failure(error: unknown): ActionState {
  if (error instanceof AppError) return { error: error.code };
  console.error('Community operation failed', error);
  return { error: 'server' };
}
function refresh(id?: string) {
  revalidatePath('/');
  revalidatePath('/profile/[id]', 'page');
  if (id) revalidatePath(`/question/${id}`);
}
export async function createQuestion(_state: ActionState, form: FormData): Promise<ActionState> {
  let id: string;
  try {
    const owner = await requireViewer();
    getStore().consumeLimit(owner, 'create', 10);
    id = getStore().create(owner, fields(form));
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/question/${id}`);
}
export async function createAnswer(
  questionId: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const owner = await requireViewer();
    getStore().consumeLimit(owner, 'create', 10);
    getStore().create(owner, fields(form), questionId);
  } catch (error) {
    return failure(error);
  }
  refresh(questionId);
  return { success: true };
}
export async function updatePost(
  id: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const owner = await requireViewer();
    getStore().consumeLimit(owner, 'update', 30);
    refresh(getStore().update(id, owner, fields(form)));
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}
export async function deletePost(id: string): Promise<ActionState> {
  let parentId: string | null;
  try {
    parentId = getStore().remove(id, await requireViewer());
  } catch (error) {
    return failure(error);
  }
  refresh(parentId ?? id);
  return { success: true, redirectTo: parentId ? undefined : '/' };
}
export async function votePost(id: string, value: number): Promise<ActionState> {
  try {
    const owner = await requireViewer();
    getStore().consumeLimit(owner, 'vote', 60);
    refresh(getStore().vote(id, owner, value));
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}
export async function acceptAnswer(id: string): Promise<ActionState> {
  try {
    refresh(getStore().accept(id, await requireViewer()));
    return { success: true };
  } catch (error) {
    return failure(error);
  }
}
