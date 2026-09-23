'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreferences } from './preferences';
import { PreferenceControls } from './preference-controls';
import { Avatar } from './ui';
import { logout } from '@/app/auth-actions';
import type { User } from '@/lib/types';

export function SiteHeader({ user }: { user: User | null }) {
  const { t } = usePreferences();
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Stack Overflow">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            stack<span className="brand-bold">overflow</span>
            <small>community</small>
          </span>
        </Link>
        <nav className="main-nav">
          <Link className={path === '/' ? 'active' : ''} href="/">
            {t.allQuestions}
          </Link>
          {user && <Link href="/?mine=1">{t.mine}</Link>}
        </nav>
        <div className="header-actions">
          <PreferenceControls />
          {user ? (
            <>
              <Link className="profile-link" href={`/profile/${user.id}`} title={t.profile}>
                <Avatar name={user.username} />
                <span>{user.username}</span>
              </Link>
              <form action={logout}>
                <button className="logout-button">{t.logout}</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn btn-secondary header-login">
              {t.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
export function SiteFooter({ year }: { year: number }) {
  const { t } = usePreferences();
  return (
    <footer className="site-footer">
      <span>© {year} Stack Overflow Clone</span>
      <span>{t.footer}</span>
    </footer>
  );
}
