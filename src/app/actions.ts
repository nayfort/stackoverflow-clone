'use server';

import { redirect } from 'next/navigation';

export async function createQuestion(formData: FormData) {
    const title = formData.get('title');

    if (typeof title !== 'string' || !title.trim()) {
        return;
    }

    // Demo placeholder: add persistence before enabling real question creation.
    redirect('/');
}
