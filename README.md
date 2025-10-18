# Chess Learner Helper

Monorepo containing:
- Frontend (React SPA): ./FrontendWebApplication
- Backend (Express + TS + Prisma): ./FrontendWebApplication_backend

## Local development

Option A: Docker Compose (recommended)

```
cp FrontendWebApplication_backend/.env.example FrontendWebApplication_backend/.env
cp FrontendWebApplication/.env.example FrontendWebApplication/.env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000 (OpenAPI /docs)
- WebSocket: ws://localhost:4000/ws/multiplayer

Option B: Run manually

Backend:
```
cd FrontendWebApplication_backend
cp .env.example .env
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

Frontend:
```
cd FrontendWebApplication
cp .env.example .env
npm install
npm start
```

## Notes

- Ensure DATABASE_URL in backend .env points to your Postgres.
- OAuth Google requires setting OAUTH_GOOGLE_* and redirect URI to http://localhost:4000/auth/oauth/google/callback.