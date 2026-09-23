'use client';
import Link from 'next/link';
import { usePreferences } from './preferences';
import { PostEditor } from './post-editor';
import { SignInPrompt } from './ui';
export default function AskQuestion({ signedIn }: { signedIn: boolean }) {
  const { t } = usePreferences();
  return (
    <>
      <Link className="back-link" href="/">
        ← {t.back}
      </Link>
      <div className="page-heading">
        <span className="eyebrow">{t.askQuestion}</span>
        <h1>{t.questionGuide}</h1>
        <p>{t.questionGuideBody}</p>
      </div>
      <div className="content-grid">
        <section className="panel editor-panel">
          {signedIn ? <PostEditor /> : <SignInPrompt />}
        </section>
        <aside className="sidebar">
          <section className="guide-card">
            <span className="guide-icon" aria-hidden="true">
              ?
            </span>
            <h2>{t.writingTips}</h2>
            <ol>
              <li>{t.tipOne}</li>
              <li>{t.tipTwo}</li>
              <li>{t.tipThree}</li>
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
