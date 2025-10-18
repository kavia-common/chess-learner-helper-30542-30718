# Chess Learner Helper - Frontend SPA

This React SPA provides the user interface for chess learning, lessons, quizzes, practice games, leaderboards, and admin tools.

## Features implemented in this skeleton

- React Router v6 with public and protected routes
- Auth flows: Register, Login, Forgot/Reset, Verify Email
- OAuth buttons wired to backend endpoints (to be implemented)
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
- REACT_APP_GOOGLE_CLIENT_ID: Google OAuth client id (frontend usage if needed later)
- REACT_APP_FEATURE_AI: true/false to enable AI game feature
- REACT_APP_FEATURE_MULTIPLAYER: true/false to enable Multiplayer feature

## Development

- Start: `npm start`
- Test: `npm test`
- Build: `npm run build`

## Integration points (TODO)

- Replace authService and other service stubs to call real backend endpoints.
- Implement refresh token flow in apiClient when 401 occurs.
- Add role-based admin route guard (protect /admin).
- Replace ChessboardPlaceholder with an interactive board and engine integrations.
