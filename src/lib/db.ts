import type { Locale } from './i18n';

export type Question = {
    id: string;
    title: Record<Locale, string>;
    author: string;
    votes: number;
};

export const mockQuestions: Question[] = [
    { id: '1', title: { en: 'How do I prepare for a mid-level developer interview?', uk: 'Як підготуватися до співбесіди на позицію мідл-розробника?' }, author: 'Vlad', votes: 15 },
    { id: '2', title: { en: 'App Router vs Pages Router: which should I learn?', uk: 'App Router чи Pages Router: що вивчати?' }, author: 'HR Manager', votes: 5 },
    { id: '3', title: { en: 'Why is TypeScript essential?', uk: 'Чому TypeScript — це основа?' }, author: 'Senior Dev', votes: 20 },
];
