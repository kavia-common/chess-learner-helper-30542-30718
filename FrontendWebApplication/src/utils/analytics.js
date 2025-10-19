//
// Lightweight analytics and error monitoring utilities.
// Default is no-op (no third-party calls, no PII). Can be enabled via env.
//
// PUBLIC INTERFACE
export function initAnalytics() {
  /**
   * Initialize analytics based on environment flags.
   * - By default, this is a no-op and nothing is sent anywhere.
   * - If REACT_APP_ENABLE_ANALYTICS is 'true', events and page views will be logged to console.
   *   Replace/integrate with a real provider here if needed in the future.
   *
   * Privacy:
   * - Do not send PII by default.
   * - Only log non-sensitive, minimal event data.
   */
  analyticsState.enabled =
    String(process.env.REACT_APP_ENABLE_ANALYTICS || '').toLowerCase() === 'true';
  analyticsState.provider = analyticsState.enabled ? 'console' : 'noop';

  if (analyticsState.enabled) {
    safeLog('[analytics] initialized', { provider: analyticsState.provider });
  }
}

// PUBLIC_INTERFACE
export function trackEvent(eventName, properties = {}) {
  /**
   * Track a non-PII event.
   * eventName: string identifier for the event (e.g., 'lesson_started')
   * properties: object with non-PII attributes (e.g., { lessonId: 'L1', mode: 'beginner' })
   *
   * Note:
   * - Avoid logging PII (emails, names, tokens, etc.). Keep metadata minimal.
   */
  if (!analyticsState.enabled) return;

  const payload = sanitize(properties);
  safeLog('[analytics] event', { event: eventName, ...payload });
}

// PUBLIC_INTERFACE
export function trackPageView(pathname, title) {
  /**
   * Track a page view for SPA route changes.
   * pathname: current route path
   * title: optional document or route title
   */
  if (!analyticsState.enabled) return;

  const payload = sanitize({ pathname, title });
  safeLog('[analytics] pageview', payload);
}

// PUBLIC_INTERFACE
export function initErrorMonitoring() {
  /**
   * Initialize error monitoring (Sentry) if REACT_APP_SENTRY_DSN is provided.
   * - Opt-in only: no DSN => no initialization.
   * - Sanitizes/limits data; excludes known PII.
   * - Respects optional REACT_APP_FEATURE_FLAGS for environment tagging.
   */
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  if (!dsn) {
    errorState.enabled = false;
    return;
  }

  // Lazy import Sentry to avoid bundling when unused (webpack code-splitting friendly).
  import(/* webpackChunkName: "sentry" */ '@sentry/react')
    .then(({ init, browserTracingIntegration, replayIntegration }) => {
      try {
        const featureFlags = process.env.REACT_APP_FEATURE_FLAGS || '';
        init({
          dsn,
          integrations: [
            browserTracingIntegration(),
            // Replay disabled by default for privacy; enable only if REACT_APP_SENTRY_REPLAY = 'true'
            ...(String(process.env.REACT_APP_SENTRY_REPLAY || '').toLowerCase() === 'true'
              ? [replayIntegration()]
              : []),
          ],
          // Sample rates: keep conservative defaults
          tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
          replaysSessionSampleRate: parseFloat(
            process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.0'
          ),
          replaysOnErrorSampleRate: parseFloat(
            process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '0.0'
          ),
          environment: process.env.NODE_ENV || 'development',
          release: process.env.REACT_APP_VERSION || undefined,
          beforeSend(event) {
            // Scrub potential PII fields just in case
            if (event.user) {
              // Remove PII
              delete event.user.email;
              delete event.user.username;
              delete event.user.name;
              // If you need an id, prefer a random/session id that is not user-identifying.
            }
            if (event.request && event.request.headers) {
              // Remove auth headers or cookies
              delete event.request.headers.Authorization;
              delete event.request.headers.Cookie;
            }
            // Annotate with feature flags if present
            if (featureFlags) {
              event.tags = { ...(event.tags || {}), feature_flags: featureFlags };
            }
            return event;
          },
        });

        errorState.enabled = true;
        safeLog('[monitoring] Sentry initialized');
      } catch (err) {
        // Fail safe - do not break the app if Sentry fails to init
        safeLog('[monitoring] Sentry initialization error', { error: String(err) });
        errorState.enabled = false;
      }
    })
    .catch((e) => {
      // Optional dep might not be installed; that's okay.
      safeLog('[monitoring] Sentry not available or failed to load', { error: String(e) });
      errorState.enabled = false;
    });
}

// Helpers and internal state
const analyticsState = {
  enabled: false,
  provider: 'noop',
};

const errorState = {
  enabled: false,
};

function sanitize(obj) {
  // Remove common PII keys if present; ensure only simple, non-sensitive fields remain.
  const forbidden = new Set([
    'email',
    'name',
    'fullName',
    'firstName',
    'lastName',
    'token',
    'password',
    'phone',
    'address',
  ]);
  const cleaned = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (forbidden.has(k)) return;
    // keep primitives and small strings; avoid big objects by default
    if (v == null) return;
    if (typeof v === 'string' && v.length > 256) return;
    if (['string', 'number', 'boolean'].includes(typeof v)) {
      cleaned[k] = v;
    }
  });
  return cleaned;
}

function safeLog(...args) {
  // Silently ignore console in environments where not available
  try {
    // eslint-disable-next-line no-console
    console.log(...args);
  } catch {
    /* noop */
  }
}

// Convenience event wrappers (optional; use directly where desired)

// PUBLIC_INTERFACE
export function logLessonStarted({ lessonId, mode }) {
  return trackEvent('lesson_started', { lessonId, mode });
}

// PUBLIC_INTERFACE
export function logLessonCompleted({ lessonId, success }) {
  return trackEvent('lesson_completed', { lessonId, success });
}

// PUBLIC_INTERFACE
export function logGameStarted({ gameType, difficulty }) {
  return trackEvent('game_started', { gameType, difficulty });
}

// PUBLIC_INTERFACE
export function logGameCompleted({ gameType, result }) {
  return trackEvent('game_completed', { gameType, result });
}

// PUBLIC_INTERFACE
export function logQuizSubmitted({ quizId, score }) {
  return trackEvent('quiz_submitted', { quizId, score });
}
