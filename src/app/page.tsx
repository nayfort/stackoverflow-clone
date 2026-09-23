'use client';

import { usePreferences } from '@/components/preferences';
import { mockQuestions } from '@/lib/db';
import Link from 'next/link';
import { createQuestion } from './actions';

export default function HomePage() {
    const { locale, t } = usePreferences();
    return (
        <div className="space-y-10">
            <section id="ask-question" className="bg-surface p-6 rounded-2xl shadow-sm border border-line scroll-mt-56">
                <h2 className="text-xl font-bold mb-4 text-foreground">{t.askQuestion}</h2>
                <p id="question-demo-note" className="text-sm text-muted mb-4">{t.demoNote}</p>
                <form action={createQuestion} className="flex flex-col sm:flex-row gap-3">
                    <input
                        name="title"
                        aria-label={t.questionTitle}
                        aria-describedby="question-demo-note"
                        placeholder={t.placeholder}
                        className="grow min-w-0 p-3 border border-line rounded-xl text-foreground focus:ring-2 focus:ring-blue-500 outline-none transition"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95">
                        {t.post}
                    </button>
                </form>
            </section>

            <section>
                <h1 className="text-2xl font-black text-foreground mb-6 uppercase tracking-tight">{t.latest}</h1>
                <div className="grid gap-4">
                    {mockQuestions.map((q) => (
                        <Link
                            key={q.id}
                            href={`/question/${q.id}`}
                            className="group block p-5 bg-surface border border-line rounded-2xl hover:border-accent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-subtle px-4 py-2 rounded-lg text-center group-hover:bg-accent-soft transition">
                                    <span className="block text-xs text-muted uppercase font-bold">{t.votes}</span>
                                    <span className="text-xl font-black text-foreground group-hover:text-accent">{q.votes}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground group-hover:text-accent mb-1 leading-tight">
                                        {q.title[locale]}
                                    </h2>
                                    <p className="text-sm text-muted italic">{t.author}: {q.author}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
