import { getStore } from '@/lib/db';
import { getViewer } from '@/lib/session';
import { parseFilters } from '@/lib/filters';
import QuestionFeed from '@/components/question-list';
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  return <QuestionFeed filters={filters} data={getStore().list(filters, await getViewer())} />;
}
