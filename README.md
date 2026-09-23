# Stack Overflow Clone

A bilingual developer Q&A application built with Next.js App Router, React, TypeScript, and SQLite. It supports real accounts, persistent questions and answers, voting, and accepted answers. The interface includes light/dark themes and English/Ukrainian localization.

This is an independent learning project, not affiliated with Stack Overflow.

## Features

- Register with a username, email, and password; log in and log out.
- View public profiles with recent questions, answer counts, and net votes received. Email addresses remain private.
- Publish questions with a title, plain-text description, and up to five tags.
- Answer questions; edit and delete your own posts. Deleting a question also deletes its answers and votes after confirmation.
- Upvote/downvote other users' posts. Clicking the same vote again removes it. Each account has one vote per post; self-voting is blocked.
- Question authors can accept one answer and change or undo their selection.
- Search question titles, descriptions, and tags; filter by tag or your own questions; sort by newest or votes; view unanswered questions. Results are paginated (12 per page).
- Language menu with keyboard navigation, theme toggle, responsive layouts, loading, empty, error, and not-found states.

UI text is translated; user-written questions and answers remain in the language in which they were posted. The database starts empty. No fake questions, accounts, or vote counts are inserted automatically.

## Requirements

- Node.js 22 or newer and npm.
- A writable, persistent local disk for SQLite.
- Internet access to install dependencies and download Geist during the initial Next.js font compilation.

## Development

```bash
npm ci
# Optional: copy .env.example to .env.local to override the defaults.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account using the interface, then select **Ask a question**. Use another account to answer or vote. You can log out and back in, or use a separate browser profile to test multiple users.

The database is created automatically at `data/community.sqlite`. Questions, answers, accounts, votes, and sessions persist after restarting the server. The database and its WAL files are excluded from Git. Never commit or publicly serve the `data` directory.

## Configuration

| Variable        | Default                 | Purpose                                                                                                     |
| --------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_PATH` | `data/community.sqlite` | SQLite database path (relative to the project root or absolute).                                            |
| `COOKIE_SECURE` | Enabled in production   | Production sessions use HTTPS-only cookies unless explicitly set to `false`. Development uses HTTP cookies. |

Theme and language preferences are stored for one year. Authentication uses a separate HTTP-only, SameSite=Lax cookie with a 30-day server-side expiration. Logging out revokes that session. Existing sessions are rotated on successful login.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
npm audit
```

`npm test` uses isolated databases and covers persistence, ownership, authentication/session expiration, password verification, voting, accepted answers, cascading deletion, input validation, search, pagination, and rate limits. It does not read or alter the application database.

For interface changes, also check registration/login/logout, question creation, answering with another account, voting, author-only editing/deletion, accepted answers, search, both locales/themes, and mobile layouts. `npm run format` formats source, tests, configuration, and documentation.

## Production

```bash
npm ci
npm run build
npm start
```

Use a Node.js server with a persistent volume and HTTPS, normally behind a reverse proxy. `npm start -- --port 3001` selects another port. For local production testing over HTTP only, run `COOKIE_SECURE=false npm start -- --port 3001`.

This version targets a single application instance with a local SQLite database, not stateless serverless hosting or multiple replicas. Do not place the database on a shared network filesystem. Back up the database with SQLite's backup API, or stop the server before copying the database and associated WAL files. Copying only the main SQLite file while the app is running can omit recent writes.

## Authentication and access control

Passwords are salted and hashed using Node.js scrypt. Only hashes of random session tokens are stored in SQLite. Protected Server Actions check the current database-backed session and post ownership on every mutation. SQL queries use bound parameters; user content is rendered as plain text, not raw HTML. Login and publishing/voting operations have basic database-backed rate limits. Next.js Server Actions provide their standard same-origin checks.

This implements the core account and Q&A workflow, not every feature of the original Stack Overflow. Before opening it to the general public, connect email verification and password recovery, add moderation/abuse handling and monitoring, and configure infrastructure-level rate limits and backups. This version has no email service, OAuth, MFA, comments, notifications, badges, or reputation-based permissions. Its profile vote total is a simple net sum, not Stack Overflow's reputation formula.

## Structure

```text
src/app/                     Routes and Server Actions
src/components/              Forms, question feed, post controls, preferences, shared UI
src/lib/store.ts             SQLite schema, queries, transactions, and ownership checks
src/lib/db.ts                Server-only database connection
src/lib/session.ts           Session cookies and server-side authentication
src/lib/password.ts          Password hashing and verification
src/lib/validation.ts        Question/answer validation
src/lib/auth-validation.ts   Account input validation
src/lib/filters.ts           Search/filter parsing and URL generation
src/lib/types.ts             Shared domain types
src/lib/i18n.ts              English/Ukrainian UI and error messages
tests/store.test.ts          Isolated domain and persistence tests
public/icon.png              Site icon
```

Tailwind CSS 4 uses `src/app/globals.css` and `@tailwindcss/postcss`; no legacy Tailwind JavaScript configuration is needed. Commit `package.json` and `package-lock.json` together. `.gitignore` excludes dependencies, build output, local environment files, runtime data, and logs. Sanitized `.env.example` files can be committed.
