'use client';

import Link from 'next/link';
import { usePreferences } from './preferences';
import { PreferenceControls } from './preference-controls';

export function SiteHeader() {
    const { t } = usePreferences();
    return (
        <header className="border-b border-line bg-surface sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <Link href="/" className="font-bold text-2xl text-foreground hover:text-accent transition">
                    🚀 Stack<span className="text-orange-500">Overflow</span>
                </Link>
                <PreferenceControls />
                <nav className="w-full flex flex-wrap gap-4 text-sm items-center">
                    <Link href="/" className="text-muted hover:text-foreground transition">{t.allQuestions}</Link>
                    <Link href="/#ask-question" className="bg-accent-soft text-accent px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition">{t.askQuestion}</Link>
                </nav>
            </div>
        </header>
    );
}

export function SiteFooter({ year }: { year: number }) {
    const { t } = usePreferences();
    return <footer className="p-10 text-center text-muted text-sm border-t border-line mt-16 bg-surface">{t.footer} | {year}</footer>;
}
