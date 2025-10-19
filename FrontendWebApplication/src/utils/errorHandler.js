//
// PUBLIC_INTERFACE
export function normalizeError(err) {
  /**
   * Normalize arbitrary error objects (HTTP errors, fetch errors, app errors) into a consistent shape.
   * Returns: { message: string, status?: number, code?: string, details?: any }
   */
  if (!err) return { message: 'Unknown error occurred' };

  // If string
  if (typeof err === 'string') {
    return { message: err };
  }

  // If already normalized
  if (err.message && (err.status || err.code || err.details)) {
    return { message: err.message, status: err.status, code: err.code, details: err.details };
  }

  // Axios-like error
  if (err.response && err.response.data) {
    const data = err.response.data;
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      (typeof data === 'string' ? data : '') ||
      err.message ||
      'Request failed';
    return { message, status: err.response.status, code: data?.code, details: data };
  }

  // Fetch Response-like error
  if (err.status && err.text) {
    return { message: err.statusText || 'Request failed', status: err.status };
  }

  // Error with cause or nested
  const message =
    err?.message ||
    err?.error ||
    err?.toString?.() ||
    'An unexpected error happened. Please try again.';

  return { message, status: err?.status, code: err?.code, details: err };
}

// PUBLIC_INTERFACE
export function handleApiError(err, { toastBus = (typeof window !== 'undefined' && window.__toastBus) || null, defaultMessage = 'Something went wrong' } = {}) {
  /**
   * Normalize and optionally show a toast notification for the error.
   * Returns normalized error object.
   */
  const n = normalizeError(err);
  const msg = n.message || defaultMessage;

  // Optionally notify user
  if (toastBus && typeof toastBus.publish === 'function') {
    toastBus.publish({ message: msg, type: 'error' });
  }

  // Log for diagnostics (can be routed to Sentry, etc.)
  // eslint-disable-next-line no-console
  console.error('[API ERROR]', n);

  return n;
}
