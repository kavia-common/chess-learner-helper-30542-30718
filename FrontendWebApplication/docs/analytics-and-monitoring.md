# Analytics and Error Monitoring

Overview:
- Default behavior is privacy-first and no-op. No third-party SDK is loaded unless explicitly enabled via environment variables.
- SPA route changes are tracked as page views when analytics is enabled.
- Key events (lesson/game/quiz) are instrumented with non-PII payloads.

Environment variables:
- REACT_APP_ENABLE_ANALYTICS=true|false (default false)
- REACT_APP_SENTRY_DSN= (optional; if present, Sentry initializes lazily)
- REACT_APP_FEATURE_FLAGS= (optional, string; used as tag in Sentry)
- REACT_APP_SENTRY_REPLAY=true|false (default false)
- REACT_APP_SENTRY_TRACES_SAMPLE_RATE (default 0.1)
- REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE (default 0.0)
- REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE (default 0.0)

Implementation notes:
- src/utils/analytics.js exports:
  - initAnalytics(): no-op by default; enables console-based logging when REACT_APP_ENABLE_ANALYTICS=true
  - trackEvent(eventName, properties)
  - trackPageView(pathname, title)
  - initErrorMonitoring(): lazy-loads @sentry/react if REACT_APP_SENTRY_DSN is set
  - helpers: logLessonStarted, logLessonCompleted, logGameStarted, logGameCompleted, logQuizSubmitted
- Route tracking: src/router/AppRouter.jsx uses useLocation to call trackPageView.

Privacy:
- PII fields are scrubbed on analytics events (email, name, token, password, phone, address).
- Sentry beforeSend removes user PII and sensitive headers.

Enablement:
1) Create .env and set desired variables.
2) Rebuild and run the app. No code changes are required for basic enablement.

Extensibility:
- Replace the console provider in src/utils/analytics.js with a real analytics SDK if needed, keeping the same API surface and privacy guarantees.
