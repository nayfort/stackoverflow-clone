export type Locale = 'en' | 'uk';
export type Theme = 'light' | 'dark';

export const messages = {
    en: {
        allQuestions: 'All questions', askQuestion: 'Ask question',
        demoNote: 'Demo only: submitted questions are not saved yet.',
        questionTitle: 'Question title', placeholder: 'For example: How does async work in JS?',
        post: 'Post', latest: 'Latest questions', votes: 'votes', author: 'Author',
        back: 'Back to list', question: 'Question', publishedBy: 'Published by',
        body: 'The text of the question...', report: 'Report',
        theme: 'Theme', light: 'Light', dark: 'Dark', language: 'Language',
        footer: 'Stack Overflow Clone', loading: 'Loading questions',
        notFound: 'Question not found', notFoundBody: 'This page does not exist or the question is unavailable.',
    },
    uk: {
        allQuestions: 'Усі запитання', askQuestion: 'Поставити запитання',
        demoNote: 'Демоверсія: надіслані запитання поки не зберігаються.',
        questionTitle: 'Заголовок запитання', placeholder: 'Наприклад: Як працює async у JS?',
        post: 'Опублікувати', latest: 'Останні запитання', votes: 'голоси', author: 'Автор',
        back: 'До списку', question: 'Запитання', publishedBy: 'Опублікував(-ла)',
        body: 'Текст запитання...', report: 'Поскаржитися',
        theme: 'Тема', light: 'Світла', dark: 'Темна', language: 'Мова',
        footer: 'Клон Stack Overflow', loading: 'Завантаження запитань',
        notFound: 'Запитання не знайдено', notFoundBody: 'Ця сторінка не існує або запитання недоступне.',
    },
};
