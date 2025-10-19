# Architecture Overview

## Introduction

This document provides an overview of the frontend architecture for the Chess Learner Helper SPA. It covers routing, state management and providers, the API/HTTP client layer, security and privacy practices, accessibility, and performance measures applied throughout the application.

## Application Entry and Composition

The application is initialized in src/index.js, which renders the root App component within BrowserRouter and React.StrictMode. Global styles include index.css and styles/accessibility.css. App composes the layout and integrates the AppRouter (see routing).

## Routing

The routing map is centralized in src/router/AppRouter.jsx using React Router v6. All top-level pages are lazy-loaded via React.lazy with a Suspense fallback to improve initial load performance.

Route guards:
- ProtectedRoute (src/components/common/ProtectedRoute.jsx) wraps children and redirects to /login when the user is not authenticated.
- RoleGuard (src/components/common/RoleGuard.jsx) ensures that only users with allowedRoles (e.g., ["admin"]) can access admin routes, redirecting unauthorized users to /.

Routing summary:
- Public: "/", "/lessons", "/lessons/:id", "/lessons/:id/quiz", "/games/ai", "/games/match", "/games/realtime/:gameId", "/history", "/history/:gameId", "/challenges", "/puzzles", "/leaderboards", "/achievements", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password".
- Private: "/profile", "/settings", "/link-accounts" (ProtectedRoute).
- Admin: "/admin" with nested routes for "content", "users", "moderation", "analytics", and "audit-log" (ProtectedRoute + RoleGuard).
- Fallback: "*" -> NotFound.

Performance elements:
- Route-level code splitting with Suspense fallback using Spinner component for accessible loading feedback.

## State Management and Providers

Global store (src/store/index.js):
- Uses React Context to hold a root state with auth and UI slices.
- rootReducer defines actions to handle login/register/refresh flows, logout, theme toggling, and notifications.
- StoreProvider supplies a { state, dispatch } value downstream.
- authActions encapsulate async calls to Auth API and dispatch resulting actions.

Domain contexts:
- Lessons (src/store/lessons.js): manage lessons list, details, quiz data, and progress via lessonsApi.
- Games (src/store/games.js): manage AI play, matchmaking, real-time stubs, and local board state.
- History (src/store/history.js): manage game history listing, replay data, hints, and analysis via historyApi.
- Gamification (src/store/gamification.js): manage achievements, leaderboards, daily challenges, and puzzles via gamificationApi.
- User (src/store/user.js): manage profile data, avatar uploads, settings, preferences, and account deletion.

Store hooks (src/store/hooks):
- useAuth, useLessons, useGames, useHistory, useGamification, useUser abstract each domain’s state and effects, minimizing coupling in pages/components.

Error boundaries:
- ErrorBoundary (src/components/common/ErrorBoundary.jsx) isolates runtime errors and presents fallback UI, improving resiliency.

## HTTP Client and API Layer

HTTP client (src/api/httpClient.js):
- axios instance configured with baseURL from getEnv().apiBaseUrl.
- withCredentials enabled to support cookie-based sessions (httpOnly).
- Request interceptor:
  - Injects Authorization: Bearer <token> if set in-memory using setAccessToken().
  - Optionally attaches CSRF header retrieved by getCsrfToken() when backend uses CSRF protection.
- Response interceptor:
  - On 401 once, attempts session refresh via Endpoints.refresh(), then retries the original request.
  - Normalizes errors via utils/errorHandler.js to provide consistent shape.

Endpoints (src/api/endpoints.js):
- Constructs all API paths for auth, users, lessons, games, history/analysis, gamification, and admin using the sanitized base URL from env.

Domain API modules:
- authApi.js, userApi.js, lessonsApi.js, gamesApi.js, historyApi.js, gamificationApi.js, adminApi.js
- Each module composes endpoints, httpClient, and error normalization to return predictable data to stores and components.

## Security and Privacy

Authentication model:
- Prefer server-managed httpOnly cookies for sessions, with withCredentials enabled.
- In-memory access token support exists for bearer flows, but tokens are not persisted to localStorage or sessionStorage by default to reduce XSS risk.

CSRF:
- getCsrfToken() in httpClient.js is a hook point to read a CSRF cookie (e.g., XSRF-TOKEN) and send it as "X-CSRF-Token". Integrate with your backend’s CSRF approach.

Input sanitization:
- Use utils/sanitize.js for any user-generated content rendered in the UI. Avoid unguarded HTML injection.

Error handling:
- utils/errorHandler.js extracts safe messages for the UI and a normalized error object to avoid leaking sensitive details.

Access control:
- ProtectedRoute and RoleGuard enforce client-side checks. Always ensure the backend enforces authorization per endpoint.

Privacy and account control:
- Profile and Settings pages integrate with userApi for updating privacy preferences, notification settings, consents, and account deletion.

## Accessibility

- Keyboard operability for interactive components (e.g., Chessboard supports arrow keys and focus management).
- ARIA attributes for progress, loading, and dynamic elements (ProgressBar, Spinner).
- High-contrast and focus-visible styles in styles/accessibility.css.
- Semantic HTML across pages with usable form labels and descriptive headings.
- Toasts and dynamic content should be announced appropriately via ARIA live regions.

## Performance

- Route-level code splitting via React.lazy reduces initial bundle size.
- Suspense fallbacks provide immediate feedback during async loading.
- PrefetchHints component exists to declaratively hint the browser to prefetch assets and routes when appropriate.
- Suggest memoization and selective rerenders for heavy components like the chessboard, and prefetching likely navigation targets (e.g., next lesson or quiz).

## Testing

- Jest-based tests executed via react-scripts in CI mode (see package.json).
- Integration tests use @testing-library, located in src/components/**/__tests__ and src/pages/**/__tests__.
- Example coverage includes routing guards (ProtectedRoute), lessons list rendering, chessboard keyboard navigation, and authentication flows.

## Future Enhancements

- Mock mode driven by feature flags (mockMode) to support local development without a backend (Step 17).
- WebSocket integration for real-time matches using REACT_APP_WS_BASE_URL.
- Progressive enhancement for prefetching and pre-rendering critical paths post-login and for frequently visited routes.
