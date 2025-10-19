# Chess Learner Helper — Frontend Web Application

This repository contains the React single-page application (SPA) for the Chess Learner Helper platform. It provides interactive lessons, quizzes, practice games against AI or real-time opponents, gamification features, user profile/settings, and admin tools. The app communicates with a backend via REST APIs and is built with performance, accessibility, security, and testability in mind.

## Project Overview and Goals

The goal of the Chess Learner Helper frontend is to deliver an engaging and accessible learning experience for chess learners of all ages. Core features include:
- Registration, authentication (email/password and OAuth), and secure session management
- Lesson delivery, quizzes, progress tracking, and personalized recommendations
- Practice games (AI and real-time), history and post-game analysis, hints with fair restrictions
- Gamification (daily challenges, puzzles, leaderboards, achievements)
- User profile, settings, and privacy controls
- Admin tools for content and users with role-based access
- Accessibility, responsiveness, strong security practices, and automated testing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API available and reachable at the configured base URL (see Environment Variables)

### Install dependencies
- npm install

### Start development server
- npm start
- App runs at http://localhost:3000

### Run tests (CI mode)
- npm test
This uses CI=true (non-interactive) to ensure compatibility with CI environments.

### Build for production
- npm run build
Outputs optimized static assets to build/.

## Environment Variables and Configuration

All environment variables are read via src/utils/env.js and must be prefixed with REACT_APP_.

Required (for backend connectivity):
- REACT_APP_API_BASE_URL: Base URL for the REST API (e.g., https://api.example.com). Calls are made via src/api/httpClient.js and src/api/endpoints.js.

Optional:
- REACT_APP_WS_BASE_URL: Base URL for WebSocket connections if used for real-time features (e.g., wss://ws.example.com).
- REACT_APP_OAUTH_GOOGLE_CLIENT_ID: OAuth client ID for Google sign-in flows used by SocialLoginButtons.
- REACT_APP_SENTRY_DSN: Sentry DSN for frontend error tracking.
- REACT_APP_FEATURE_FLAGS: Feature flags as JSON or comma-separated key:value (e.g., {"mockMode":false} or mockMode:true,lessonsV2:on).
- REACT_APP_BUILD_VERSION: Build/version string injected into the app (defaults to 0.0.0).

Validation and parsing:
- env.js performs minimal validation, trims and sanitizes URLs, and parses REACT_APP_FEATURE_FLAGS from JSON or key:value CSV.

## Architecture Overview

### Routing Map

The SPA uses React Router v6 with route-level code splitting via React.lazy and Suspense. See src/router/AppRouter.jsx.

Public routes:
- /: Home
- /lessons: Lessons list
- /lessons/:id: Lesson detail
- /lessons/:id/quiz: Lesson quiz
- /games/ai: AI play
- /games/match: Matchmaking
- /games/realtime/:gameId: Real-time game
- /history: Game history
- /history/:gameId: Game replay
- /challenges: Daily challenge
- /puzzles: Puzzles
- /leaderboards: Leaderboards
- /achievements: Achievements
- /login: Login
- /register: Register
- /verify-email: Verify email
- /forgot-password: Forgot password
- /reset-password: Reset password
- 404 fallback: *

Protected routes:
- /profile: Requires auth (ProtectedRoute)
- /settings: Requires auth (ProtectedRoute)
- /link-accounts: Requires auth (ProtectedRoute)

Admin (nested, requires auth + role=admin via RoleGuard):
- /admin (redirects to /admin/content)
- /admin/content
- /admin/users
- /admin/moderation
- /admin/analytics
- /admin/audit-log

Performance:
- All major page-level components are lazy-loaded. Suspense fallback uses an accessible Spinner component.

### State Strategy and Providers

Global store:
- src/store/index.js defines a context-based store with initialState, rootReducer, and action creators for auth and UI notifications. Store is consumed via useStore() and StoreProvider.

Domain-specific stores and hooks:
- src/store/lessons.js, src/store/games.js, src/store/history.js, src/store/gamification.js, src/store/user.js define domain reducers, contexts, and provider patterns for lessons, games, history, gamification, and user management.
- src/store/hooks/* exposes hooks such as useAuth, useLessons, useGames, useHistory, useGamification, and useUser, encapsulating state access and side effects to keep pages/components lean.

Guards:
- src/components/common/ProtectedRoute.jsx checks authentication from the global store and redirects unauthenticated users to /login.
- src/components/common/RoleGuard.jsx restricts access to children based on user roles, redirecting unauthorized users to /.

Error isolation:
- src/components/common/ErrorBoundary.jsx provides a global error boundary for resilient rendering.

### HTTP Client and API Layer

HTTP client:
- src/api/httpClient.js wraps axios with:
  - Base URL from env (getEnv().apiBaseUrl)
  - withCredentials enabled for secure session cookies
  - Request interceptor attaches Authorization bearer token if set in-memory and CSRF header if available
  - Response interceptor handles a single 401 retry flow via /auth/refresh endpoint
  - Standardized error normalization via src/utils/errorHandler.js

Endpoints:
- src/api/endpoints.js constructs full URLs for all domains (auth, users, lessons, games, history/analysis, gamification, admin) using the configured base URL.
- Each domain API module (authApi.js, lessonsApi.js, gamesApi.js, historyApi.js, gamificationApi.js, adminApi.js, userApi.js) consumes httpClient and endpoints and returns normalized results.

Security posture:
- Access tokens are kept in-memory (not persisted) by default to reduce XSS risk.
- Prefer server-managed httpOnly session cookies for primary authentication.
- If persisting tokens is necessary, do so explicitly in auth flows and document the risks.

### Security and Privacy Practices

- Session Auth: Prefer httpOnly, secure cookies. httpClient enables withCredentials. Do not store tokens in localStorage unless absolutely necessary.
- CSRF: Hook points in httpClient to attach a CSRF header if the backend provides a token (e.g., XSRF-TOKEN cookie). Update getCsrfToken() to integrate with your backend strategy.
- Input Sanitization: Use src/utils/sanitize.js where user-generated content is rendered. Keep dangerouslySetInnerHTML out of the codebase unless sanitized and justified.
- Error Messages: errorHandler.js normalizes errors while avoiding leakage of sensitive backend details.
- Access Control: ProtectedRoute and RoleGuard enforce auth and role checks in the UI. Backend must always enforce authorization independently.
- Privacy: Settings page includes privacy, notification preferences, consent toggles, and account deletion workflow (via user store and APIs).

### Accessibility Features and Checklist

Implemented:
- Keyboard navigation in interactive components (e.g., Chessboard supports arrow key navigation and focus management).
- ARIA attributes and labels on controls (e.g., ProgressBar aria-* attributes, Spinner’s aria-live).
- High contrast and focus-visible styles via styles/accessibility.css.
- Semantic structure and headings on pages.
- Toast notifications announced via ARIA where applicable.

Checklist for contributions:
- Provide accessible names for interactive elements (aria-label, aria-labelledby).
- Ensure focus order is logical. Manage focus on route changes when needed.
- Use role attributes only when semantic elements are insufficient.
- Maintain sufficient color contrast. Check against WCAG AA.
- Support keyboard operation for all functionality.
- Provide alt text for images and labels for form fields.

## API Contracts (Frontend Expectations)

The frontend expects the following REST endpoints. The base URL is REACT_APP_API_BASE_URL. Exact shapes may vary by backend; ensure backend aligns with these contracts or adjust API layer accordingly.

Auth
- POST /auth/login: { email, password } -> { user, token? } or sets session cookie
- POST /auth/logout: clears session
- POST /auth/register: { email, password } -> { user } or confirmation flow
- GET /auth/me: returns current session user
- POST /auth/refresh: refreshes session cookie or access token
- POST /auth/forgot-password: { email }
- POST /auth/reset-password: { token, newPassword }
- POST /auth/verify-email: { token }
- GET /auth/oauth/google: OAuth initiation (redirect)
- POST /auth/link-accounts: link social providers

Users
- GET /users/:id: user profile
- PATCH /users/:id: update profile
- POST /users/:id/avatar: multipart avatar upload

Lessons and Progress
- GET /lessons: list lessons with progress summary
- GET /lessons/:id: lesson detail content
- GET /lessons/:id/quiz: quiz items
- POST /lessons/:id/quiz: submit answers -> results and feedback
- GET /progress: aggregated progress and recommendations

Games and History
- GET /games: list/open games
- POST /games/ai: start new AI game
- POST /games/matchmaking: enqueue for matchmaking
- GET /games/:id: get current game state
- GET /history: list past games with filters/pagination
- GET /history/:gameId: retrieve historical game with moves
- GET /history/:gameId/analysis: post-game analysis metrics
- Optional WebSocket endpoints if REACT_APP_WS_BASE_URL is used for real-time updates

Gamification
- GET /gamification/achievements
- GET /gamification/leaderboards?period=weekly|monthly|all
- GET /gamification/daily-challenge
- GET /gamification/puzzles?difficulty=...
- POST /gamification/puzzles/:id/submit: submit puzzle solution

Admin
- GET /admin/dashboard: summary metrics
- GET /admin/analytics
- GET /admin/audit-log
- GET/POST /admin/content
- GET/POST/PATCH /admin/users
- GET/POST /admin/moderation

See docs/api-contracts.md for detailed request/response structures.

## Testing Strategy

- Unit and integration tests using react-scripts (Jest) and @testing-library utilities.
- Tests live near features under src/pages/**/__tests__ and src/components/**/__tests__.
- Run tests in CI mode with npm test (uses CI=true and --watchAll=false).
- Example tests include routing guards, lessons list rendering, protected routes, and chessboard interactions.

How to run:
- npm test

## Continuous Integration

- Tests are configured to run in non-interactive mode by default in package.json.
- Recommend integrating with your CI system to run npm ci && npm test on pull requests and main branch merges.
- For production builds, run npm run build and publish build/ artifacts.

## Mock Mode and Feature Flags

Mock backend mode:
- Toggle: REACT_APP_USE_MOCKS=true (preferred) or set REACT_APP_FEATURE_FLAGS to include mockMode:true
- When enabled in development, the app starts MSW (Mock Service Worker) and intercepts API requests to return realistic mock data.
- Supported domains in mocks: auth, users, lessons, quizzes, progress, games, history/analysis, gamification (achievements, leaderboards, daily challenge, puzzles), and admin (dashboard, analytics, audit-log, content, moderation, users).
- On unhandled requests, MSW bypasses to network so production APIs can still be hit when available.

How to use:
1) Create .env (or use .env.example) with:
   REACT_APP_USE_MOCKS=true
   REACT_APP_API_BASE_URL=
2) npm start
   The app will boot without a backend and render major routes with mocked data.

Notes:
- MSW is only started in development builds when REACT_APP_USE_MOCKS is true.
- In production builds, MSW is not started even if the flag is set.
- You can still set REACT_APP_FEATURE_FLAGS='mockMode:true' as an alternative; env.js maps it to useMocks.

## Performance Measures

Implemented:
- Route-level code splitting with React.lazy and Suspense in AppRouter.
- Accessible Suspense fallback Spinner to keep users informed during loading.
- Prefetch hints component (components/common/PrefetchHints.jsx) is available to declaratively add link rel=prefetch/prerender when needed.

Recommendations:
- Use memoization and selective re-renders in heavy components like Chessboard.
- Prefetch lesson detail or next quiz when a user is likely to navigate there.
- Minimize bundle size by keeping large dependencies out of initial render and leveraging lazy imports.

## Analytics and Error Monitoring

Analytics and error monitoring are disabled by default and include no third-party calls unless explicitly enabled.

- Analytics
  - No-op by default. Enable with REACT_APP_ENABLE_ANALYTICS=true to log non-PII events to the console provider.
  - Page views are recorded on route changes automatically when enabled.
  - Key events logged: lesson_started, lesson_completed, game_started, game_completed, quiz_submitted.
  - Extend src/utils/analytics.js to integrate a real provider while keeping privacy-safe payloads.

- Error Monitoring (optional Sentry)
  - Enabled only when REACT_APP_SENTRY_DSN is set.
  - Sentry is lazy-loaded to avoid bundle impact when disabled.
  - beforeSend scrubs PII like user email/username/name and sensitive headers.

Environment variables:
- REACT_APP_ENABLE_ANALYTICS=false
- REACT_APP_SENTRY_DSN=
- REACT_APP_FEATURE_FLAGS=
- REACT_APP_SENTRY_REPLAY=false
- REACT_APP_SENTRY_TRACES_SAMPLE_RATE=0.1
- REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.0
- REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.0

## Repository Structure

- src/router/AppRouter.jsx: Routing map with guards and lazy loading
- src/api/httpClient.js, src/api/endpoints.js, src/api/*.js: API layer
- src/store/index.js and src/store/*: Global and domain stores with hooks
- src/components/common/*: Shared UI components (Spinner, Skeleton, Toast, ProtectedRoute, RoleGuard, ErrorBoundary)
- src/components/games, src/components/history: Feature components
- src/pages/*: Route pages organized by domain (auth, lessons, games, history, gamification, admin)
- src/utils/*: env parsing, constants, sanitization, validators, error handling
- src/styles/accessibility.css: Accessibility and contrast helpers

## Support and Contributions

- Follow the accessibility checklist and security practices outlined above.
- Align backend responses with API contracts or update API modules and docs accordingly.
- Add tests for new features and ensure CI remains green.
