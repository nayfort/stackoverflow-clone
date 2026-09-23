'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { login, register } from '@/app/auth-actions';
import { usePreferences } from './preferences';
import { ErrorNotice } from './ui';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t } = usePreferences();
  const registering = mode === 'register';
  const [state, submit, pending] = useActionState(registering ? register : login, {});
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{registering ? t.join : t.welcomeBack}</h1>
        <p>{registering ? t.registerIntro : t.loginIntro}</p>
        <div className="auth-decoration" aria-hidden="true">
          <span>&lt;/&gt;</span>
          <span>?</span>
          <span>✓</span>
        </div>
      </div>
      <section className="panel auth-panel">
        <h2>{registering ? t.register : t.login}</h2>
        <form action={submit} className="editor">
          {registering && (
            <label className="field">
              <span>{t.username}</span>
              <input
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={30}
                required
              />
              <small>{t.usernameHint}</small>
            </label>
          )}
          <label className="field">
            <span>{t.email}</span>
            <input
              type="email"
              name="email"
              autoComplete={registering ? 'email' : 'username'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              required
            />
          </label>
          <label className="field">
            <span>{t.password}</span>
            <input
              type="password"
              name="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              maxLength={128}
              required
            />
            {registering && <small>{t.passwordHint}</small>}
          </label>
          <ErrorNotice error={state.error} />
          <button className="btn btn-primary" disabled={pending}>
            {pending ? t.publishing : registering ? t.register : t.login}
          </button>
          {registering && <p className="fine-print">{t.emailPrivate}</p>}
        </form>
        <p className="auth-alternate">
          {registering ? t.haveAccount : t.needAccount}{' '}
          <Link href={registering ? '/login' : '/register'}>
            {registering ? t.login : t.register}
          </Link>
        </p>
      </section>
    </div>
  );
}
