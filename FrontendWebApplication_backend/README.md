# Chess Learner Helper - Backend API (Node.js/Express + TypeScript + Prisma)

This service provides REST endpoints for authentication, users, lessons, quizzes, games, progress, and admin tools.

## Tech stack

- Node.js 18+, Express, TypeScript
- Prisma ORM with PostgreSQL
- JWT auth, role-based access (LEARNER, ADMIN)
- CORS, Helmet, Rate limiting, Morgan logging
- Validation with Zod
- Swagger/OpenAPI at /docs

## Quick start

1) Install dependencies

- Ensure PostgreSQL is available and a DATABASE_URL is configured.
- Copy .env.example to .env and fill values.

```
cp .env.example .env
npm install
```

2) Prisma setup

```
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

3) Run dev server

```
npm run dev
```

API will run at http://localhost:${PORT:-4000}
OpenAPI docs at http://localhost:${PORT:-4000}/docs

## Scripts

- dev: start dev server with ts-node-dev
- build: compile TypeScript
- start: run compiled JS
- prisma:generate: generate Prisma client
- prisma:migrate: run development migration (creates new migration if needed)
- prisma:deploy: apply migrations in production
- prisma:studio: open Prisma Studio
- seed: basic data seed
- test: placeholder

## Environment variables

See .env.example for complete list:
- PORT, APP_BASE_URL, WEBSOCKET_URL, CORS_ORIGINS
- DATABASE_URL
- JWT_SECRET, JWT_REFRESH_SECRET
- EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- OAUTH_GOOGLE_CLIENT_ID, OAUTH_GOOGLE_CLIENT_SECRET, OAUTH_GOOGLE_REDIRECT_URI

## Routes overview

- /auth: register, login, refresh, logout, verify-email, resend-verification, forgot-password, reset-password, oauth/google/callback (stub)
- /users: me (GET/PUT), delete, upload-avatar (stub)
- /lessons: list, get/:id, progress (POST)
- /quizzes: list, get/:id, submit (POST)
- /games: start-ai, move, history, detail/:id
- /progress: summary, leaderboards
- /admin: users CRUD, audit logs, lessons CRUD under /admin/lessons

All protected endpoints require Authorization: Bearer <token>.

## Notes

- Email sending and Google OAuth are stubbed for now.
- Avatar upload is not implemented (returns 501).
- WebSocket endpoints are not implemented yet; a future service can mount them and update docs accordingly.
