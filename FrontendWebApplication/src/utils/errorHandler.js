"use strict";

/**
 * Centralized error handling utilities
 * Ensures a consistent normalized error shape across the app.
 */

// PUBLIC_INTERFACE
export function extractErrorMessage(error) {
  /** Extracts a human-readable message from any error-like object. */
  if (!error) return "An unknown error occurred";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.data && error.data.message) return error.data.message;
  return "An unexpected error occurred";
}

// PUBLIC_INTERFACE
export function normalizeError(err) {
  /** Normalizes any error into a consistent object. */
  const status = err?.response?.status ?? err?.status ?? null;
  const data = err?.response?.data ?? err?.data ?? null;
  const message =
    (data && (data.error || data.message || data.detail)) ||
    err?.message ||
    "An unexpected error occurred";
  const code = data?.code || err?.code || null;

  return {
    message,
    status,
    code,
    data,
    original: err,
    isNetworkError: !!(err?.message && /network error/i.test(err.message)),
  };
}

// PUBLIC_INTERFACE
export function handleApiError(
  err,
  {
    toastBus = (typeof window !== "undefined" && window.__toastBus) || null,
    defaultMessage = "Something went wrong",
  } = {}
) {
  /**
   * Normalize and optionally show a toast notification for the error.
   * Returns normalized error object.
   */
  const n = normalizeError(err);
  const msg = n.message || defaultMessage;

  if (toastBus && typeof toastBus.publish === "function") {
    toastBus.publish({ message: msg, type: "error" });
  }

  // eslint-disable-next-line no-console
  console.error("[API ERROR]", n);

  return n;
}
