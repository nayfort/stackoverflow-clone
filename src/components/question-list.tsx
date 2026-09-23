'use client';

import Link from 'next/link';
import { countWord } from '@/lib/i18n';
import { usePreferences } from './preferences';
import { Avatar, PostDate } from './ui';
import { filterUrl } from '@/lib/filters';
import type { Question, QuestionList, Filters } from '@/lib/types';

export function QuestionCard({ question }: { question: Question }) {
  const { locale } = usePreferences();
  return (
    <article className="question-card">
      <div className="question-metrics">
        <span>
          <strong>{question.votes}</strong>
          {countWord(question.votes, locale, 'votes')}
        </span>
        <span
          className={
            question.solved ? 'metric-solved' : question.answerCount ? 'metric-answered' : ''
          }
        >
          <strong>
            {question.solved ? '✓ ' : ''}
            {question.answerCount}
          </strong>
          {countWord(question.answerCount, locale, 'answers')}
        </span>
      </div>
      <div className="question-summary">
        <Link className="question-title" href={`/question/${question.id}`}>
          {question.title}
        </Link>
        <p className="question-excerpt">{question.body}</p>
        <div className="question-meta">
          <div className="tag-list">
            {question.tags.map((tag) => (
              <Link href={`/?tag=${encodeURIComponent(tag)}`} className="tag" key={tag}>
                {tag}
              </Link>
            ))}
          </div>
          <div className="author-line">
            <Link href={`/profile/${question.authorId}`}>
              <Avatar name={question.author} />
              {question.author}
            </Link>
            <PostDate value={question.createdAt} />
          </div>
        </div>
      </div>
    </article>
  );
}
export default function QuestionFeed({ data, filters }: { data: QuestionList; filters: Filters }) {
  const { t } = usePreferences();
  const filtered = !!(
    filters.query ||
    filters.tag ||
    filters.mine ||
    filters.sort === 'unanswered'
  );
  const page = Math.min(filters.page, data.pages);
  return (
    <>
      <section className="community-hero">
        <div>
          <span className="eyebrow">
            <span className="live-dot" />
            {t.eyebrow}
          </span>
          <h1>{t.hero}</h1>
          <p>{t.intro}</p>
          <Link className="btn btn-primary" href="/ask">
            <span aria-hidden="true">＋</span>
            {t.askQuestion}
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{data.stats.questions}</strong>
            <span>{t.totalQuestions}</span>
          </div>
          <div>
            <strong>{data.stats.answers}</strong>
            <span>{t.totalAnswers}</span>
          </div>
          <div>
            <strong>{data.stats.solved}</strong>
            <span>{t.totalSolved}</span>
          </div>
        </div>
      </section>
      <div className="content-grid">
        <section>
          <div className="feed-heading">
            <h2>
              {filters.mine ? t.mine : t.latest}
              <span>{data.total}</span>
            </h2>
          </div>
          <form action="/" method="get" className="search-form">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
            <input
              key={filters.query}
              name="q"
              defaultValue={filters.query}
              placeholder={t.search}
              aria-label={t.searchButton}
              maxLength={200}
            />
            {filters.mine && <input type="hidden" name="mine" value="1" />}
            {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
            <input type="hidden" name="sort" value={filters.sort} />
            <button className="btn btn-secondary">{t.searchButton}</button>
          </form>
          <div className="feed-toolbar">
            <nav className="filter-tabs" aria-label={t.allQuestions}>
              {(['newest', 'popular', 'unanswered'] as const).map((sort) => (
                <Link
                  key={sort}
                  aria-current={sort === filters.sort ? 'page' : undefined}
                  href={filterUrl(filters, { sort, page: 1 })}
                >
                  {t[sort]}
                </Link>
              ))}
            </nav>
            {filtered && (
              <Link className="clear-link" href="/">
                {t.clear} ×
              </Link>
            )}
          </div>
          {filters.tag && (
            <div className="active-filter">
              <span className="tag">#{filters.tag}</span>
            </div>
          )}
          <div className="question-list">
            {data.questions.length ? (
              data.questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">
                  &lt;/&gt;
                </span>
                <h3>{filtered ? t.noResults : t.empty}</h3>
                <p>{filtered ? t.noResultsBody : t.emptyBody}</p>
                <Link className="btn btn-primary" href={filtered ? '/' : '/ask'}>
                  {filtered ? t.clear : t.askQuestion}
                </Link>
              </div>
            )}
          </div>
          {data.pages > 1 && (
            <nav className="pagination" aria-label={t.allQuestions}>
              {page > 1 ? (
                <Link className="btn btn-secondary" href={filterUrl(filters, { page: page - 1 })}>
                  ← {t.previous}
                </Link>
              ) : (
                <span />
              )}
              <span>
                {page} / {data.pages}
              </span>
              {page < data.pages ? (
                <Link className="btn btn-secondary" href={filterUrl(filters, { page: page + 1 })}>
                  {t.next} →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
        <aside className="sidebar">
          <section className="guide-card">
            <span className="guide-icon" aria-hidden="true">
              ✦
            </span>
            <h2>{t.community}</h2>
            <p>{t.guidelines}</p>
            <Link href="/ask" className="text-link">
              {t.askQuestion} →
            </Link>
          </section>
          <section className="topics-panel">
            <h2>{t.topTags}</h2>
            {data.tags.length ? (
              <div className="topic-list">
                {data.tags.map((tag) => (
                  <Link key={tag.name} href={`/?tag=${encodeURIComponent(tag.name)}`}>
                    <span className="tag">{tag.name}</span>
                    <span>{tag.count}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">{t.noTags}</p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
