# Chess Learner Helper - Frontend SPA

This React SPA provides the user interface for chess learning, lessons, quizzes, practice games, leaderboards, and admin tools.

## Features

- React Router v6 with public and protected routes
- Auth flows: Register, Login, Forgot/Reset, Verify Email
- OAuth buttons wired to backend endpoints
- Global AuthContext with token storage in localStorage
- API client reads env variables (REACT_APP_API_BASE_URL, REACT_APP_WS_URL)
- Feature flags: REACT_APP_FEATURE_MULTIPLAYER, REACT_APP_FEATURE_AI
- Accessibility helpers: focus-on-mount, high contrast toggle
- Global ErrorBoundary
- Shared components: Navbar, Footer, ProgressBar
- ChessboardPlaceholder component
- Unit tests with Jest + React Testing Library
- .env.example documenting required variables

## Environment variables

Copy `.env.example` to `.env` and update values.

- REACT_APP_API_BASE_URL: Base URL for backend REST API (e.g., http://localhost:4000)
- REACT_APP_WS_URL: WebSocket base URL (e.g., ws://localhost:4000)
- REACT_APP_GOOGLE_CLIENT_ID: Google OAuth client id (optional)
- REACT_APP_FEATURE_AI: true/false to enable AI game feature
- REACT_APP_FEATURE_MULTIPLAYER: true/false to enable Multiplayer feature

## Development

- Start: `npm start`
- Test: `npm test`
- Build: `npm run build`

## Backend integration

This frontend calls the backend endpoints:

- Auth: 
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
  - POST /auth/verify-email
  - POST /auth/forgot-password
  - POST /auth/reset-password
  - GET  /auth/oauth/google (starts OAuth flow)
- Users:
  - GET /users/me
  - PUT /users/me
  - POST /users/upload-avatar
- Lessons:
  - GET /lessons
  - GET /lessons/:id
  - POST /lessons/progress
- Quizzes:
  - GET /quizzes
  - GET /quizzes/:id
  - POST /quizzes/submit
- Progress:
  - GET /progress/summary
  - GET /progress/leaderboards
- Games:
  - POST /games/start-ai
  - POST /games/ai-move
  - POST /games/move
  - GET /games/history
  - GET /games/detail/:id

WebSocket:
- ws(s)://<REACT_APP_WS_URL>/ws/multiplayer?token=<JWT>

## Run with Docker Compose

From the repository root:

```
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000 (Docs at /docs)
- WebSocket: ws://localhost:4000/ws/multiplayer

