import { mockQuestions } from '@/lib/db';
import { notFound } from 'next/navigation';
import QuestionDetails from '@/components/question-details';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function QuestionPage({ params }: Props) {
    const { id } = await params;

    const question = mockQuestions.find((q) => q.id === id);

    if (!question) {
        notFound();
    }

    return <QuestionDetails question={question} />;
}
