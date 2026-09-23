'use client';

import Link from 'next/link';
import { usePreferences } from '@/components/preferences';

export default function NotFound() {
  const { t } = usePreferences();
  return (
    <section className="py-16 text-center space-y-5">
      <p className="text-accent font-bold">404</p>
      <h1 className="text-3xl font-bold">{t.notFound}</h1>
      <p className="text-muted">{t.notFoundBody}</p>
      <Link href="/" className="inline-block text-accent hover:underline">
        ← {t.back}
      </Link>
    </section>
  );
}
