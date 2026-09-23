'use client';

import { useActionState, useState } from 'react';
import { createQuestion, createAnswer, updatePost } from '@/app/actions';
import type { Post } from '@/lib/types';
import { usePreferences } from './preferences';
import { ErrorNotice } from './ui';

export function PostEditor({
  post,
  questionId,
  onClose,
}: {
  post?: Post;
  questionId?: string;
  onClose?: () => void;
}) {
  const { t } = usePreferences();
  const isQuestion = !questionId && !post?.parentId;
  const action = post
    ? updatePost.bind(null, post.id)
    : questionId
      ? createAnswer.bind(null, questionId)
      : createQuestion;
  const [state, submit, pending] = useActionState(action, {});
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  if (state.success)
    return (
      <div className="notice notice-success" role="status">
        <p>{post ? t.saved : t.answerSaved}</p>
        {onClose && (
          <button type="button" className="text-link" onClick={onClose}>
            {t.done}
          </button>
        )}
      </div>
    );
  return (
    <form action={submit} className="editor">
      {isQuestion && (
        <label className="field">
          <span>{t.questionTitle}</span>
          <small>{t.titleHint}</small>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.placeholder}
            minLength={10}
            maxLength={160}
            required
          />
        </label>
      )}
      <label className="field">
        <span>{isQuestion ? t.body : t.answerTitle}</span>
        <small>{isQuestion ? t.bodyHint : t.answerHint}</small>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={20}
          maxLength={10000}
          rows={isQuestion ? 10 : 7}
          required
        />
      </label>
      {isQuestion && (
        <label className="field">
          <span>{t.tags}</span>
          <small>{t.tagsHint}</small>
          <input
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.tagPlaceholder}
            maxLength={160}
          />
        </label>
      )}
      <ErrorNotice error={state.error} />
      <div className="button-row">
        <button className="btn btn-primary" disabled={pending}>
          {pending ? t.publishing : post ? t.save : isQuestion ? t.post : t.postAnswer}
        </button>
        {onClose && (
          <button type="button" className="btn btn-secondary" disabled={pending} onClick={onClose}>
            {t.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
