'use client';

import { usePreferences } from '@/components/preferences';

export default function Loading() {
  const { t } = usePreferences();
  return (
    <div role="status" className="max-w-2xl mx-auto py-10 px-4">
      <span className="sr-only">{t.loading}</span>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none space-y-4">
        <div className="h-8 bg-line rounded w-1/2 mb-8"></div>
        <div className="h-32 bg-subtle rounded-xl"></div>
        <div className="h-32 bg-subtle rounded-xl"></div>
        <div className="h-32 bg-subtle rounded-xl"></div>
      </div>
    </div>
  );
}
