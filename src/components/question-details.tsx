'use client';

import Link from 'next/link';
import type { Question } from '@/lib/db';
import { usePreferences } from './preferences';

export default function QuestionDetails({ question }: { question: Question }) {
    const { locale, t } = usePreferences();
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/" className="text-sm text-accent hover:underline">
                ← {t.back}
            </Link>

            <div className="bg-surface p-8 rounded-3xl shadow-sm border border-line">
                <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="bg-badge text-badge-text px-3 py-1 rounded-full text-xs font-bold uppercase">
            {t.question} #{question.id}
          </span>
                    <span className="text-muted text-sm">{t.publishedBy} {question.author}</span>
                </div>

                <h1 className="text-3xl font-black text-foreground leading-tight mb-4">
                    {question.title[locale]}
                </h1>

                <div className="py-10 border-y border-line text-muted italic">
                    {t.body}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-subtle rounded-lg hover:bg-line transition font-bold text-foreground">
                            👍 {question.votes}
                        </button>
                    </div>
                    <button className="text-muted hover:text-foreground text-sm">
                        {t.report}
                    </button>
                </div>
            </div>
        </div>
    );
}
