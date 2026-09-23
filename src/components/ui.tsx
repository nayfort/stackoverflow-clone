'use client';
import Link from 'next/link';
import { usePreferences } from './preferences';
import { errorMessages } from '@/lib/i18n';
import type { ErrorCode } from '@/lib/types';

export function ErrorNotice({ error }: { error?: ErrorCode }) {
  const { locale } = usePreferences();
  return error ? (
    <p className="notice notice-error" role="alert">
      {errorMessages[locale][error]}
    </p>
  ) : null;
}
export function PostDate({ value }: { value: string }) {
  const { locale } = usePreferences();
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(value))}
    </time>
  );
}
export function SignInPrompt() {
  const { t } = usePreferences();
  return (
    <div className="join-card">
      <h3>{t.signInPrompt}</h3>
      <p>{t.signInBody}</p>
      <div className="button-row">
        <Link className="btn btn-primary" href="/register">
          {t.register}
        </Link>
        <Link className="btn btn-secondary" href="/login">
          {t.login}
        </Link>
      </div>
    </div>
  );
}
export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
