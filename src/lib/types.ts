export type Post = {
  id: string;
  parentId: string | null;
  title: string;
  body: string;
  author: string;
  authorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  votes: number;
  myVote: number;
  isOwner: boolean;
  accepted: boolean;
};
export type Question = Post & { answerCount: number; solved: boolean };
export type QuestionDetail = Question & { answers: Post[] };
export type Filters = {
  query: string;
  tag: string;
  sort: 'newest' | 'popular' | 'unanswered';
  mine: boolean;
  page: number;
};
export type QuestionList = {
  questions: Question[];
  total: number;
  pages: number;
  stats: { questions: number; answers: number; solved: number };
  tags: { name: string; count: number }[];
};
export type ErrorCode =
  | 'title'
  | 'body'
  | 'author'
  | 'tags'
  | 'missing'
  | 'forbidden'
  | 'selfVote'
  | 'invalid'
  | 'rateLimit'
  | 'server'
  | 'auth'
  | 'email'
  | 'password'
  | 'username'
  | 'credentials'
  | 'duplicate';
export type ActionState = { error?: ErrorCode; success?: boolean; redirectTo?: string };
export class AppError extends Error {
  constructor(public code: ErrorCode) {
    super(code);
  }
}

export type User = { id: string; username: string; createdAt: string };
export type Profile = User & { questions: Question[]; answerCount: number; reputation: number };
