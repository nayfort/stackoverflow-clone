import { getStore } from '@/lib/db';
import { getViewer } from '@/lib/session';
import { notFound } from 'next/navigation';
import QuestionDetails from '@/components/question-details';
export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getViewer();
  const question = getStore().detail(id, viewer);
  if (!question) notFound();
  return <QuestionDetails question={question} signedIn={!!viewer} />;
}
