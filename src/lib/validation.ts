import { AppError } from './types';

function text(value: unknown, min: number, max: number, field: 'title' | 'body' | 'author') {
  if (typeof value !== 'string') throw new AppError(field);
  const result = value.trim();
  if (result.length < min || result.length > max) throw new AppError(field);
  return result;
}
export function validatePost(
  input: { title?: unknown; body: unknown; author: unknown; tags?: unknown },
  question: boolean,
) {
  const body = text(input.body, 20, 10000, 'body');
  const author = text(input.author, 2, 40, 'author');
  const title = question ? text(input.title, 10, 160, 'title') : '';
  if (question && typeof input.tags !== 'string') throw new AppError('tags');
  const raw = question ? (input.tags as string).trim() : '';
  if (raw.length > 160) throw new AppError('tags');
  const tags = [
    ...new Set(
      raw
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  if (tags.length > 5 || tags.some((tag) => !/^[\p{L}\p{N}][\p{L}\p{N}.+#-]{0,23}$/u.test(tag)))
    throw new AppError('tags');
  return { title, body, author, tags };
}
export function validateId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) throw new AppError('missing');
}
