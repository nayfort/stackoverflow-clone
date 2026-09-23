# Stack Overflow Clone

A small Stack Overflow-inspired demo built with Next.js App Router, React, TypeScript, and Tailwind CSS. It displays sample questions and individual question pages.

## Current functionality

- Browse three sample questions with author names and vote counts.
- Switch between English and Ukrainian through a custom language menu, including sample question titles and the not-found page. The menu supports arrow keys, Home/End, Escape, and dismissal on outside click.
- Toggle light and dark themes with a single sun/moon button; language and theme choices persist for one year in browser cookies.
- Open a question at `/question/[id]` and return to the list.
- Show a localized not-found page for an unknown question ID.
- Display a loading skeleton while a route is loading.
- Submit a demo question form through a Server Action.

**This is a UI prototype, not a complete Q&A service.** Questions come from the static `mockQuestions` array in `src/lib/db.ts`; there is no database or persistence. The form validates that the title is not blank and redirects to `/` without saving it. Question bodies are placeholder text, vote counts are static, and the vote and Report buttons do not perform any action. Authentication, user-specific lists, answers, and moderation are not implemented.

## Requirements

- Node.js 20.9 or later.
- npm (the repository uses `package-lock.json`).
- Internet access during the first development compilation and production builds to download the Geist font through `next/font/google`.

No environment variables or external services are required for the demo.

The default language is English and the default theme is light. The `locale` (`en` / `uk`) and `theme` (`light` / `dark`) cookies store preferences. The server reads them before rendering, so reloads use the saved appearance and language without a client-side flash. Invalid values fall back to the defaults. Pages are rendered dynamically because the root layout reads cookies.

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Changes to source files appear automatically during development.

To use a different port:

```bash
npm run dev -- --port 3001
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

Linting and type checking are separate commands. The production build also checks TypeScript. There is currently no automated test suite; manually check the question list, question details, an unknown question ID, and the demo form after changing those flows. Also check both themes and languages, navigation, and preference persistence after a reload.

## Production

```bash
npm ci
npm run build
npm start
```

The production server defaults to port 3000. Stop the development server first or start production on another port with `npm start -- --port 3001`. A Node.js server is required for the Server Action; a static export is not configured.

## Project structure

```text
public/icon.png                  Site icon
src/app/layout.tsx               Shared navigation, metadata, and footer
src/app/page.tsx                 Question list and demo form
src/app/actions.ts               Demo question Server Action
src/app/loading.tsx              Loading skeleton
src/app/question/[id]/page.tsx    Question details and not-found handling
src/app/globals.css              Tailwind CSS entry point
src/lib/db.ts                    Static sample data (not a database)
src/lib/i18n.ts                  English and Ukrainian translations
src/components/                 Preferences, shared shell, question details
src/app/not-found.tsx            Localized not-found page
postcss.config.mjs               Tailwind CSS PostCSS plugin
```

Tailwind CSS 4 uses the CSS entry point and automatic source detection; there is no legacy JavaScript Tailwind configuration. See the [Tailwind CSS upgrade guide](https://tailwindcss.com/docs/upgrade-guide) for the PostCSS setup.

## Repository hygiene

Commit `package.json` and `package-lock.json` together when dependencies change. Generated builds, installed dependencies, logs, local environment files, editor files, and private keys are ignored. Sanitized `.env.example` and `.env.*.example` files may be committed if configuration is added later; never put secrets in them.

Exact dependency versions are recorded in `package-lock.json`.
