# Chess Learner Helper - Backend API (Node.js/Express + TypeScript + Prisma)

This service provides REST endpoints for authentication, users, lessons, quizzes, games, progress, and admin tools, plus WebSocket multiplayer and adapters for email/OAuth/storage.

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
WebSocket namespace: ws://localhost:${PORT:-4000}/ws/multiplayer

Notes:
- Google OAuth: set OAUTH_GOOGLE_CLIENT_ID, OAUTH_GOOGLE_CLIENT_SECRET, and OAUTH_GOOGLE_REDIRECT_URI (must match /auth/oauth/google/callback)
- SMTP email: set SMTP_* and EMAIL_FROM to enable real sending; if SMTP_HOST is empty, emails will be logged to console
- Storage: set STORAGE_DRIVER=local (default) or s3. For s3, set S3_ENDPOINT (for S3-compatible), S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
- Env validation runs on startup and will warn for missing optional vars and exit for missing required vars.

## Docker Compose (local dev)

From the repository root:

```
docker-compose up --build
```

This starts:
- Postgres at localhost:5432
- Backend at http://localhost:4000
- Frontend at http://localhost:3000

On first run the backend container runs `prisma migrate deploy`. If developing schema, exec into container to run `npm run prisma:migrate`.

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
- lint: echo "No linter configured yet" && exit 0

## Environment variables

See .env.example for complete list:
- PORT, APP_BASE_URL, CORS_ORIGINS
- DATABASE_URL
- JWT_SECRET, JWT_REFRESH_SECRET
- EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- OAUTH_GOOGLE_CLIENT_ID, OAUTH_GOOGLE_CLIENT_SECRET, OAUTH_GOOGLE_REDIRECT_URI
- STORAGE_DRIVER and optional S3_*

## Routes overview

- /auth: register, login, refresh, logout, verify-email, resend-verification, forgot-password, reset-password, oauth/google, oauth/google/callback
- /users: me (GET/PUT/DELETE), upload-avatar
- /lessons: list, get/:id, progress (POST)
- /quizzes: list, get/:id, submit (POST)
- /games: start-ai, ai-move, move, history, detail/:id
- /progress: summary, leaderboards
- /admin: users CRUD, audit logs, lessons CRUD under /admin/lessons

All protected endpoints require Authorization: Bearer <token>.
