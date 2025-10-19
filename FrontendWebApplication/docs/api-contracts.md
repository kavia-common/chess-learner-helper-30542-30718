# API Contracts

## Introduction

This document defines the REST API contracts that the frontend expects from the backend. Base URL comes from REACT_APP_API_BASE_URL (see src/utils/env.js). All endpoints and URL constructors are defined in src/api/endpoints.js. The HTTP client in src/api/httpClient.js uses withCredentials for session cookies and supports an optional bearer token in memory.

Note: Response shapes shown are representative. The frontend API layer (authApi.js, lessonsApi.js, gamesApi.js, historyApi.js, gamificationApi.js, adminApi.js, userApi.js) should be adapted if backend differs.

## Authentication

POST /auth/login
- Body: { "email": "user@example.com", "password": "Secret123!" }
- Success: 200 { "user": { "id": "u1", "email": "user@example.com", "name": "Pat" }, "token": "optional-jwt" } or sets secure session cookie
- Error: 401/400 { "message": "Invalid credentials" }

POST /auth/logout
- Success: 204 or 200 { "message": "Logged out" }

POST /auth/register
- Body: { "email": "user@example.com", "password": "Secret123!" }
- Success: 201 { "user": { "id": "u1", "email": "user@example.com" }, "requiresEmailVerification": true }

GET /auth/me
- Success: 200 { "id": "u1", "email": "user@example.com", "name": "Pat", "roles": ["user"] }

POST /auth/refresh
- Success: 204 or 200 { "accessToken": "optional-jwt" } and/or new session cookie

POST /auth/forgot-password
- Body: { "email": "user@example.com" }
- Success: 204

POST /auth/reset-password
- Body: { "token": "reset-token", "newPassword": "NewSecret123!" }
- Success: 204

POST /auth/verify-email
- Body: { "token": "verification-token" }
- Success: 204

GET /auth/oauth/google
- Redirect to Google OAuth.

POST /auth/link-accounts
- Body: { "provider": "google", "token": "oauth-token" }
- Success: 200 { "linked": true }

## Users

GET /users/:id
- Success: 200 { "id": "u1", "email": "user@example.com", "name": "Pat", "bio": "", "avatarUrl": "...", "settings": { ... } }

PATCH /users/:id
- Body: Partial user updates (e.g., { "name": "New Name", "bio": "..." })
- Success: 200 updated user object

POST /users/:id/avatar
- Form-data: file=avatar.png
- Success: 201 { "avatarUrl": "https://..." }

## Lessons and Progress

GET /lessons
- Query: ?topic=...&difficulty=...&page=1&pageSize=20
- Success: 200 { "items": [{ "id": "l1", "title": "...", "difficulty": "beginner", "progress": { "completed": true } }], "total": 100 }

GET /lessons/:id
- Success: 200 { "id": "l1", "title": "Opening Principles", "content": "...", "media": [ ... ], "prerequisites": [ "..." ] }

GET /lessons/:id/quiz
- Success: 200 { "lessonId": "l1", "questions": [{ "id": "q1", "type": "mcq", "prompt": "...", "options": [ "a", "b", "c", "d" ] }] }

POST /lessons/:id/quiz
- Body: { "answers": [{ "questionId": "q1", "answer": "a" }] }
- Success: 200 { "score": 80, "results": [{ "questionId": "q1", "correct": true, "explanation": "..." }], "completed": true }

GET /progress
- Success: 200 { "summary": { "lessonsCompleted": 12, "quizzesCompleted": 8 }, "recommendations": [{ "lessonId": "l3", "reason": "..." }] }

## Games and History

GET /games
- Success: 200 { "items": [{ "id": "g1", "status": "in_progress", "opponent": "u2" }], "total": 2 }

POST /games/ai
- Body: { "difficulty": "beginner|intermediate|advanced" }
- Success: 201 { "id": "g2", "status": "in_progress", "color": "white", "fen": "..." }

POST /games/matchmaking
- Body: { "mode": "casual|rated" }
- Success: 202 { "queueId": "q1", "estimatedWaitSec": 15 }

GET /games/:id
- Success: 200 { "id": "g1", "moves": ["e4", "e5", ...], "fen": "...", "turn": "white", "status": "in_progress" }

GET /history
- Query: ?page=1&pageSize=20&result=win|loss|draw&opponent=userId
- Success: 200 { "items": [{ "id": "h1", "date": "...", "result": "win", "opponent": "u2", "movesCount": 42 }], "total": 50 }

GET /history/:gameId
- Success: 200 { "id": "h1", "moves": [ "e4", "e5", ... ], "result": "win", "analysisAvailable": true }

GET /history/:gameId/analysis
- Success: 200 { "blunders": 2, "mistakes": 4, "inaccuracies": 6, "accuracy": 0.78, "notes": [ "..." ] }

## Gamification

GET /gamification/achievements
- Success: 200 { "badges": [{ "id": "b1", "name": "First Win", "earned": true }], "points": 1200, "streak": 5 }

GET /gamification/leaderboards
- Query: ?period=weekly|monthly|all
- Success: 200 { "period": "weekly", "entries": [{ "user": "u1", "points": 150 }] }

GET /gamification/daily-challenge
- Success: 200 { "id": "dc1", "title": "Mate in 2", "expiresAt": "..." }

GET /gamification/puzzles
- Query: ?difficulty=easy|medium|hard&page=1&pageSize=20
- Success: 200 { "items": [{ "id": "p1", "fen": "...", "difficulty": "easy" }], "total": 200 }

POST /gamification/puzzles/:id/submit
- Body: { "moves": ["e4", "e5"] }
- Success: 200 { "correct": true, "explanation": "..." }

## Admin

GET /admin/dashboard
- Success: 200 { "activeUsers": 1234, "lessonCompletions": 567, "dailyChallengesCompleted": 234 }

GET /admin/analytics
- Success: 200 { "metrics": [{ "name": "DAU", "value": 300 }, { "name": "Retention", "value": 0.42 }] }

GET /admin/audit-log
- Query: ?page=1&pageSize=50&actor=u1&action=update_user
- Success: 200 { "items": [{ "id": "al1", "actor": "u1", "action": "update_user", "timestamp": "..." }], "total": 1000 }

GET /admin/content
- Success: 200 { "items": [{ "id": "l1", "title": "Opening Principles", "status": "published" }] }

POST /admin/content
- Body: { "title": "New Lesson", "content": "...", "status": "draft" }
- Success: 201 { "id": "l2", "title": "New Lesson", "status": "draft" }

GET /admin/users
- Success: 200 { "items": [{ "id": "u1", "email": "user@example.com", "roles": ["user"] }] }

POST /admin/users
- Body: { "email": "new@example.com", "roles": ["user"] }
- Success: 201 { "id": "u3", "email": "new@example.com", "roles": ["user"] }

POST /admin/moderation
- Body: { "itemId": "flag1", "action": "approve|reject" }
- Success: 200 { "status": "approved" }

## Error Shape

The frontend normalizes errors via utils/errorHandler.js. Recommended backend response on errors:
- Status code 4xx/5xx
- Body: { "message": "human-readable summary", "code": "OPTIONAL_CODE", "details": "OPTIONAL_DETAILS" }

This allows consistent messaging in the UI without leaking internal information.

## Authentication, CSRF, and Cookies

- Sessions: Prefer httpOnly, secure cookies with SameSite=Lax or Strict.
- CSRF: If using cookie-based sessions, include a separate CSRF token (e.g., XSRF-TOKEN). The client can send "X-CSRF-Token" header. Update getCsrfToken() in httpClient.js to read your CSRF cookie.
- CORS: Configure the backend to allow credentials and the origin of the frontend when using cookies.

## Versioning

- If endpoints must change in breaking ways, increment a version prefix (e.g., /v2) and expose both old and new routes during migration. Update src/api/endpoints.js accordingly.
