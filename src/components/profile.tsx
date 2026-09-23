'use client';
import type { Profile } from '@/lib/types';
import { usePreferences } from './preferences';
import { Avatar, PostDate } from './ui';
import { QuestionCard } from './question-list';
export default function ProfileView({ profile }: { profile: Profile }) {
  const { t } = usePreferences();
  return (
    <>
      <section className="profile-heading panel">
        <Avatar name={profile.username} />
        <div>
          <span className="eyebrow">{t.profile}</span>
          <h1>{profile.username}</h1>
          <p>
            {t.joined} <PostDate value={profile.createdAt} />
          </p>
        </div>
        <div className="profile-stats">
          <span>
            <strong>{profile.reputation}</strong>
            {t.reputation}
          </span>
          <span>
            <strong>{profile.answerCount}</strong>
            {t.totalAnswers}
          </span>
        </div>
      </section>
      <div className="feed-heading">
        <h2>{t.profileQuestions}</h2>
      </div>
      <div className="question-list">
        {profile.questions.length ? (
          profile.questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))
        ) : (
          <div className="empty-state">
            <p>{t.profileEmpty}</p>
          </div>
        )}
      </div>
    </>
  );
}
