'use client';

import Link from 'next/link';
import { countWord } from '@/lib/i18n';
import type { QuestionDetail, Post } from '@/lib/types';
import { usePreferences } from './preferences';
import { VoteControls, OwnerControls, AuthorLink } from './post-controls';
import { PostEditor } from './post-editor';
import { Avatar, PostDate, SignInPrompt } from './ui';

function PostContent({
  post,
  signedIn,
  canAccept = false,
}: {
  post: Post;
  signedIn: boolean;
  canAccept?: boolean;
}) {
  const { t } = usePreferences();
  return (
    <div className={`post-content ${post.accepted ? 'post-accepted' : ''}`}>
      <VoteControls post={post} signedIn={signedIn} />
      <div className="post-main">
        {post.accepted && <span className="accepted-label">✓ {t.accepted}</span>}
        <div className="post-body">{post.body}</div>
        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link href={`/?tag=${encodeURIComponent(tag)}`} key={tag} className="tag">
              {tag}
            </Link>
          ))}
        </div>
        <div className="post-byline">
          <Avatar name={post.author} />
          <div>
            <AuthorLink post={post} />
            <span>
              <PostDate value={post.createdAt} />
              {post.updatedAt !== post.createdAt && ` · ${t.edited}`}
            </span>
          </div>
        </div>
        <OwnerControls post={post} canAccept={canAccept} />
      </div>
    </div>
  );
}
export default function QuestionDetails({
  question,
  signedIn,
}: {
  question: QuestionDetail;
  signedIn: boolean;
}) {
  const { t, locale } = usePreferences();
  return (
    <>
      <Link className="back-link" href="/">
        ← {t.back}
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">
            {t.question}
            {question.solved ? ` · ${t.solved}` : ''}
          </span>
          <h1>{question.title}</h1>
          <p>
            {t.publishedBy} <Link href={`/profile/${question.authorId}`}>{question.author}</Link> ·{' '}
            <PostDate value={question.createdAt} />
          </p>
        </div>
        <Link href="/ask" className="btn btn-primary">
          {t.askQuestion}
        </Link>
      </div>
      <div className="content-grid">
        <section>
          <article className="panel">
            <PostContent post={question} signedIn={signedIn} />
          </article>
          <div className="answers-heading">
            <h2>
              {question.answers.length} {countWord(question.answers.length, locale, 'answers')}
            </h2>
            <span>{t.popular}</span>
          </div>
          <div className="answer-list">
            {question.answers.length ? (
              question.answers.map((answer) => (
                <article key={answer.id} className="panel">
                  <PostContent post={answer} signedIn={signedIn} canAccept={question.isOwner} />
                </article>
              ))
            ) : (
              <div className="empty-answers">
                <h3>{t.noAnswers}</h3>
                <p>{t.noAnswersBody}</p>
              </div>
            )}
          </div>
          <section className="panel answer-editor" key={question.answers.length}>
            {signedIn ? <PostEditor questionId={question.id} /> : <SignInPrompt />}
          </section>
        </section>
        <aside className="sidebar">
          <section className="guide-card">
            <span className="guide-icon" aria-hidden="true">
              ↗
            </span>
            <h2>{t.writingTips}</h2>
            <p>{t.answerHint}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
