'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { votePost, acceptAnswer, deletePost } from '@/app/actions';
import { usePreferences } from './preferences';
import { ErrorNotice } from './ui';
import { PostEditor } from './post-editor';
import type { Post, ErrorCode } from '@/lib/types';

export function VoteControls({ post, signedIn }: { post: Post; signedIn: boolean }) {
  const { t } = usePreferences();
  const [pending, start] = useTransition();
  const [error, setError] = useState<ErrorCode>();
  const vote = (value: number) =>
    start(async () => {
      try {
        setError((await votePost(post.id, value)).error);
      } catch {
        setError('server');
      }
    });
  return (
    <div className="voting">
      <div className="vote-stack">
        {[1, -1].map((value) => (
          <button
            type="button"
            key={value}
            className={post.myVote === value ? 'voted' : ''}
            disabled={pending || post.isOwner || !signedIn}
            aria-pressed={post.myVote === value}
            aria-label={value === 1 ? t.upvote : t.downvote}
            title={
              !signedIn ? t.login : post.isOwner ? t.ownVote : value === 1 ? t.upvote : t.downvote
            }
            onClick={() => vote(value)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={value === 1 ? 'm6 14 6-6 6 6' : 'm6 10 6 6 6-6'} />
            </svg>
          </button>
        ))}
        <strong aria-live="polite">{post.votes}</strong>
      </div>
      <ErrorNotice error={error} />
    </div>
  );
}
export function OwnerControls({ post, canAccept = false }: { post: Post; canAccept?: boolean }) {
  const { t } = usePreferences();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<ErrorCode>();
  if (editing)
    return (
      <div className="inline-editor">
        <h3>{post.parentId ? t.editAnswer : t.editQuestion}</h3>
        <PostEditor post={post} onClose={() => setEditing(false)} />
      </div>
    );
  return (
    <>
      <div className="post-actions">
        {post.isOwner && (
          <>
            <button type="button" onClick={() => setEditing(true)}>
              {t.edit}
            </button>
            <button type="button" onClick={() => setConfirm(!confirm)}>
              {t.remove}
            </button>
          </>
        )}
        {canAccept && (
          <button
            type="button"
            className={post.accepted ? 'accepted-action' : ''}
            disabled={pending}
            onClick={() =>
              start(async () => {
                try {
                  setError((await acceptAnswer(post.id)).error);
                } catch {
                  setError('server');
                }
              })
            }
          >
            {post.accepted ? '✓ ' : ''}
            {post.accepted ? t.unaccept : t.accept}
          </button>
        )}
      </div>
      {confirm && (
        <div className="delete-confirm">
          <strong>{t.confirmDelete}</strong>
          <p>{t.deleteHint}</p>
          <div className="button-row">
            <button
              type="button"
              className="btn btn-danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  try {
                    const result = await deletePost(post.id);
                    setError(result.error);
                    if (result.success) setConfirm(false);
                    if (result.redirectTo) router.push(result.redirectTo);
                  } catch {
                    setError('server');
                  }
                })
              }
            >
              {pending ? t.publishing : t.remove}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pending}
              onClick={() => setConfirm(false)}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
      <ErrorNotice error={error} />
    </>
  );
}
export function AuthorLink({ post }: { post: Post }) {
  return <Link href={`/profile/${post.authorId}`}>{post.author}</Link>;
}
