import { mockQuestions } from '@/lib/db';
import Link from 'next/link';
import { createQuestion } from './actions';

export default async function HomePage() {
    await new Promise((res) => setTimeout(res, 800));

    return (
        <div className="space-y-10">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Ask question</h2>
                <form action={createQuestion} className="flex flex-col sm:flex-row gap-3">
                    <input
                        name="title"
                        placeholder="For example: How does async work in JS?"
                        className="flex-grow p-3 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95">
                        Post
                    </button>
                </form>
            </section>

            <section>
                <h1 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Last questions</h1>
                <div className="grid gap-4">
                    {mockQuestions.map((q) => (
                        <Link
                            key={q.id}
                            href={`/question/${q.id}`}
                            className="group block p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline"
                        >
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-100 px-4 py-2 rounded-lg text-center group-hover:bg-blue-50 transition">
                                    <span className="block text-xs text-slate-500 uppercase font-bold">votes</span>
                                    <span className="text-xl font-black text-slate-800 group-hover:text-blue-600">{q.votes}</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-1 leading-tight">
                                        {q.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 italic">Author: {q.author}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}