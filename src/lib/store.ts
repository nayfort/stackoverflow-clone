import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  AppError,
  type Filters,
  type Question,
  type QuestionDetail,
  type QuestionList,
  type User,
  type Profile,
} from './types';
import { validatePost, validateId } from './validation';

type Row = {
  id: string;
  parent_id: string | null;
  owner: string;
  title: string;
  body: string;
  author: string;
  tags: string;
  created_at: string;
  updated_at: string;
  accepted: number;
  votes: number;
  my_vote: number;
  answer_count: number;
  solved: number;
};
const selectPost = `SELECT p.*, COALESCE((SELECT SUM(value) FROM votes WHERE post_id=p.id),0) AS votes,
    COALESCE((SELECT value FROM votes WHERE post_id=p.id AND owner=@viewer),0) AS my_vote,
    (SELECT COUNT(*) FROM posts WHERE parent_id=p.id) AS answer_count,
    EXISTS(SELECT 1 FROM posts WHERE parent_id=p.id AND accepted=1) AS solved FROM posts p`;
const escapeLike = (text: string) => text.replace(/[\\%_]/g, '\\$&');

export class Store {
  readonly db: Database.Database;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    const version = this.db.pragma('user_version', { simple: true }) as number;
    if (version > 1) throw new Error('The database schema is newer than this application.');
    if (version === 0)
      this.db.transaction(() =>
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, username_key TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, created_at TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
            CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY, parent_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
                owner TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL DEFAULT '',
                body TEXT NOT NULL, author TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]',
                search_text TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                accepted INTEGER NOT NULL DEFAULT 0 CHECK(accepted IN (0,1))
            );
            CREATE INDEX IF NOT EXISTS posts_parent ON posts(parent_id);
            CREATE INDEX IF NOT EXISTS posts_owner ON posts(owner);
            CREATE UNIQUE INDEX IF NOT EXISTS one_accepted_answer ON posts(parent_id) WHERE accepted=1;
            CREATE INDEX IF NOT EXISTS posts_created ON posts(created_at);
            CREATE TABLE IF NOT EXISTS votes (
                post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                owner TEXT NOT NULL REFERENCES users(id), value INTEGER NOT NULL CHECK(value IN(-1,1)),
                PRIMARY KEY(post_id, owner)
            );
            CREATE TABLE IF NOT EXISTS rate_limits (owner TEXT NOT NULL, action TEXT NOT NULL, window INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(owner, action));
            PRAGMA user_version = 1;
        `),
      )();
  }
  close() {
    this.db.close();
  }
  createUser(username: string, email: string, password: string): User {
    const id = randomUUID();
    const now = new Date().toISOString();
    try {
      this.db
        .prepare('INSERT INTO users VALUES (?,?,?,?,?,?)')
        .run(id, username, username.toLowerCase(), email, password, now);
    } catch (error) {
      if (error instanceof Database.SqliteError && error.code.startsWith('SQLITE_CONSTRAINT'))
        throw new AppError('duplicate');
      throw error;
    }
    return { id, username, createdAt: now };
  }
  credentials(email: string) {
    return this.db.prepare('SELECT id, password FROM users WHERE email=?').get(email) as
      { id: string; password: string } | undefined;
  }
  user(id: string): User | null {
    return (
      (this.db
        .prepare('SELECT id,username,created_at AS createdAt FROM users WHERE id=?')
        .get(id) as User | undefined) ?? null
    );
  }
  createSession(id: string, userId: string) {
    this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());
    this.db
      .prepare('INSERT INTO sessions VALUES (?,?,?)')
      .run(id, userId, Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  session(id: string) {
    const row = this.db
      .prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?')
      .get(id, Date.now()) as { user_id: string } | undefined;
    return row ? this.user(row.user_id) : null;
  }
  deleteSession(id: string) {
    this.db.prepare('DELETE FROM sessions WHERE id=?').run(id);
  }
  private requireUser(owner: string) {
    const user = this.user(owner);
    if (!user) throw new AppError('auth');
    return user;
  }
  private row(id: string) {
    validateId(id);
    const row = this.db.prepare('SELECT * FROM posts WHERE id=?').get(id) as Row | undefined;
    if (!row) throw new AppError('missing');
    return row;
  }
  private owned(id: string, owner: string) {
    this.requireUser(owner);
    const row = this.row(id);
    if (row.owner !== owner) throw new AppError('forbidden');
    return row;
  }
  private map(row: Row, viewer: string): Question {
    return {
      id: row.id,
      parentId: row.parent_id,
      title: row.title,
      body: row.body,
      author: row.author,
      authorId: row.owner,
      tags: JSON.parse(row.tags),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      votes: row.votes,
      myVote: row.my_vote,
      isOwner: row.owner === viewer,
      accepted: !!row.accepted,
      answerCount: row.answer_count,
      solved: !!row.solved,
    };
  }
  consumeLimit(owner: string, action: string, limit: number) {
    this.db.transaction(() => {
      const window = Math.floor(Date.now() / 60000);
      this.db.prepare('DELETE FROM rate_limits WHERE window < ?').run(window - 60);
      this.db
        .prepare(
          `INSERT INTO rate_limits VALUES (?,?,?,1) ON CONFLICT(owner,action) DO UPDATE SET
                count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END, window=excluded.window`,
        )
        .run(owner, action, window);
      const row = this.db
        .prepare('SELECT count FROM rate_limits WHERE owner=? AND action=?')
        .get(owner, action) as { count: number };
      if (row.count > limit) throw new AppError('rateLimit');
    })();
  }
  create(
    owner: string,
    input: { title?: unknown; body: unknown; author?: unknown; tags?: unknown },
    parentId: string | null = null,
  ) {
    const data = validatePost(
      { ...input, author: this.requireUser(owner).username },
      parentId === null,
    );
    return this.db.transaction(() => {
      if (parentId && this.row(parentId).parent_id) throw new AppError('invalid');
      const id = randomUUID();
      const now = new Date().toISOString();
      this.db
        .prepare(
          `INSERT INTO posts(id,parent_id,owner,title,body,author,tags,search_text,created_at,updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          id,
          parentId,
          owner,
          data.title,
          data.body,
          data.author,
          JSON.stringify(data.tags),
          `${data.title} ${data.body} ${data.tags.join(' ')}`.toLowerCase(),
          now,
          now,
        );
      return id;
    })();
  }
  update(
    id: string,
    owner: string,
    input: { title?: unknown; body: unknown; author?: unknown; tags?: unknown },
  ) {
    const row = this.owned(id, owner);
    const data = validatePost(
      { ...input, author: this.requireUser(owner).username },
      !row.parent_id,
    );
    this.db
      .prepare(
        'UPDATE posts SET title=?,body=?,author=?,tags=?,search_text=?,updated_at=? WHERE id=?',
      )
      .run(
        data.title,
        data.body,
        data.author,
        JSON.stringify(data.tags),
        `${data.title} ${data.body} ${data.tags.join(' ')}`.toLowerCase(),
        new Date().toISOString(),
        id,
      );
    return row.parent_id ?? id;
  }
  remove(id: string, owner: string) {
    const row = this.owned(id, owner);
    this.db.prepare('DELETE FROM posts WHERE id=?').run(id);
    return row.parent_id;
  }
  vote(id: string, owner: string, value: number) {
    this.requireUser(owner);
    if (value !== 1 && value !== -1) throw new AppError('invalid');
    return this.db.transaction(() => {
      const row = this.row(id);
      if (row.owner === owner) throw new AppError('selfVote');
      const previous = this.db
        .prepare('SELECT value FROM votes WHERE post_id=? AND owner=?')
        .get(id, owner) as { value: number } | undefined;
      if (previous?.value === value)
        this.db.prepare('DELETE FROM votes WHERE post_id=? AND owner=?').run(id, owner);
      else
        this.db
          .prepare(
            'INSERT INTO votes VALUES (?,?,?) ON CONFLICT(post_id,owner) DO UPDATE SET value=excluded.value',
          )
          .run(id, owner, value);
      return row.parent_id ?? id;
    })();
  }
  accept(answerId: string, owner: string) {
    return this.db.transaction(() => {
      const answer = this.row(answerId);
      if (!answer.parent_id) throw new AppError('invalid');
      this.owned(answer.parent_id, owner);
      this.db.prepare('UPDATE posts SET accepted=0 WHERE parent_id=?').run(answer.parent_id);
      if (!answer.accepted) this.db.prepare('UPDATE posts SET accepted=1 WHERE id=?').run(answerId);
      return answer.parent_id;
    })();
  }
  detail(id: string, viewer = ''): QuestionDetail | null {
    const row = this.db
      .prepare(`${selectPost} WHERE p.id=@id AND p.parent_id IS NULL`)
      .get({ id, viewer }) as Row | undefined;
    if (!row) return null;
    const answers = this.db
      .prepare(
        `${selectPost} WHERE p.parent_id=@id ORDER BY p.accepted DESC,votes DESC,p.created_at ASC`,
      )
      .all({ id, viewer }) as Row[];
    return { ...this.map(row, viewer), answers: answers.map((answer) => this.map(answer, viewer)) };
  }
  profile(id: string, viewer = ''): Profile | null {
    const user = this.user(id);
    if (!user) return null;
    const questions = (
      this.db
        .prepare(
          `${selectPost} WHERE p.owner=@id AND p.parent_id IS NULL ORDER BY p.created_at DESC LIMIT 50`,
        )
        .all({ id, viewer }) as Row[]
    ).map((row) => this.map(row, viewer));
    const answerCount = (
      this.db
        .prepare('SELECT COUNT(*) AS count FROM posts WHERE owner=? AND parent_id IS NOT NULL')
        .get(id) as { count: number }
    ).count;
    const reputation = (
      this.db
        .prepare(
          'SELECT COALESCE(SUM(value),0) AS score FROM votes WHERE post_id IN (SELECT id FROM posts WHERE owner=?)',
        )
        .get(id) as { score: number }
    ).score;
    return { ...user, questions, answerCount, reputation };
  }
  list(filters: Filters, viewer = ''): QuestionList {
    const where = `p.parent_id IS NULL AND (@query='' OR p.search_text LIKE @pattern ESCAPE '\\')
            AND (@tag='' OR EXISTS(SELECT 1 FROM json_each(p.tags) WHERE value=@tag))
            AND (@mine=0 OR p.owner=@viewer)
            AND (@unanswered=0 OR NOT EXISTS(SELECT 1 FROM posts a WHERE a.parent_id=p.id))`;
    const params = {
      query: filters.query,
      pattern: `%${escapeLike(filters.query.toLowerCase())}%`,
      tag: filters.tag,
      mine: Number(filters.mine),
      viewer,
      unanswered: Number(filters.sort === 'unanswered'),
    };
    const total = (
      this.db.prepare(`SELECT COUNT(*) AS count FROM posts p WHERE ${where}`).get(params) as {
        count: number;
      }
    ).count;
    const pages = Math.max(1, Math.ceil(total / 12));
    const order = filters.sort === 'popular' ? 'votes DESC,p.created_at DESC' : 'p.created_at DESC';
    const rows = this.db
      .prepare(`${selectPost} WHERE ${where} ORDER BY ${order} LIMIT 12 OFFSET @offset`)
      .all({ ...params, offset: (Math.min(pages, filters.page) - 1) * 12 }) as Row[];
    const stats = this.db
      .prepare(
        `SELECT COUNT(*) FILTER(WHERE parent_id IS NULL) AS questions, COUNT(*) FILTER(WHERE parent_id IS NOT NULL) AS answers,
            COUNT(*) FILTER(WHERE parent_id IS NOT NULL AND accepted=1) AS solved FROM posts`,
      )
      .get() as QuestionList['stats'];
    const tags = this.db
      .prepare(
        `SELECT j.value AS name,COUNT(*) AS count FROM posts p,json_each(p.tags) j WHERE p.parent_id IS NULL GROUP BY j.value ORDER BY count DESC,name ASC LIMIT 12`,
      )
      .all() as QuestionList['tags'];
    return { questions: rows.map((row) => this.map(row, viewer)), total, pages, stats, tags };
  }
}
