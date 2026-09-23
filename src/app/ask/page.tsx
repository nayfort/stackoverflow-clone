import { getViewer } from '@/lib/session';
import AskQuestion from '@/components/ask-question';
export default async function AskPage() {
  return <AskQuestion signedIn={!!(await getViewer())} />;
}
