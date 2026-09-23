'use client';
import { usePreferences } from '@/components/preferences';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = usePreferences();
  return (
    <section className="empty-state panel">
      <h1>{t.errorTitle}</h1>
      <p>{t.errorBody}</p>
      <button className="btn btn-primary" onClick={reset}>
        {t.retry}
      </button>
    </section>
  );
}
