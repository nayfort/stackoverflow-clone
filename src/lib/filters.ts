import type { Filters } from './types';
export function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const value = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  const sort = value('sort');
  return {
    query: value('q').trim().slice(0, 200),
    tag: value('tag').trim().toLowerCase().slice(0, 24),
    sort: sort === 'popular' || sort === 'unanswered' ? sort : 'newest',
    mine: value('mine') === '1',
    page: Math.max(1, Math.min(100000, parseInt(value('page'), 10) || 1)),
  };
}
export function filterUrl(filters: Filters, changes: Partial<Filters> = {}) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.query) params.set('q', next.query);
  if (next.tag) params.set('tag', next.tag);
  if (next.sort !== 'newest') params.set('sort', next.sort);
  if (next.mine) params.set('mine', '1');
  if (next.page > 1) params.set('page', String(next.page));
  return `/?${params}`;
}
