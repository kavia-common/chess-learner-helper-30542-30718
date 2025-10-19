"use strict";

/**
 * Env utility helpers for safely reading and validating environment variables.
 * All variables are read at build-time from process.env.REACT_APP_*
 * Do NOT access process.env directly in modules outside this file.
 */

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns the processed environment configuration used across the app. */
  const {
    REACT_APP_API_BASE_URL,
    REACT_APP_WS_BASE_URL,
    REACT_APP_OAUTH_GOOGLE_CLIENT_ID,
    REACT_APP_SENTRY_DSN,
    REACT_APP_FEATURE_FLAGS,
    REACT_APP_BUILD_VERSION,
    NODE_ENV,
  } = process.env;

  const featureFlags = parseFeatureFlags(REACT_APP_FEATURE_FLAGS);

  const config = {
    apiBaseUrl: sanitizeUrl(REACT_APP_API_BASE_URL || ""),
    wsBaseUrl: sanitizeUrl(REACT_APP_WS_BASE_URL || ""),
    googleClientId: (REACT_APP_OAUTH_GOOGLE_CLIENT_ID || "").trim(),
    sentryDsn: (REACT_APP_SENTRY_DSN || "").trim(),
    featureFlags,
    buildVersion: (REACT_APP_BUILD_VERSION || "0.0.0").trim(),
    isProd: NODE_ENV === "production",
    isDev: NODE_ENV !== "production",
  };

  // Minimal validation
  if (!config.apiBaseUrl) {
    // We do not throw to avoid crashing the build; downstream usage will warn.
    // eslint-disable-next-line no-console
    console.warn("[env] REACT_APP_API_BASE_URL is not set. API calls may fail.");
  }
  return config;
}

// PUBLIC_INTERFACE
export function requireEnvVar(name, value) {
  /** Throws a descriptive error when a required env var is missing. */
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseFeatureFlags(jsonish) {
  if (!jsonish) return {};
  try {
    // Allow simple JSON or comma-separated key:value
    if (jsonish.trim().startsWith("{")) {
      return JSON.parse(jsonish);
    }
    const flags = {};
    jsonish.split(",").forEach((pair) => {
      const [k, v] = pair.split(":").map((s) => (s || "").trim());
      if (k) flags[k] = parseTruthy(v);
    });
    return flags;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[env] Failed to parse REACT_APP_FEATURE_FLAGS. Using empty object.", e);
    return {};
  }
}

function parseTruthy(v) {
  if (v === undefined) return true;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function sanitizeUrl(url) {
  if (!url) return "";
  // Remove trailing slashes to avoid double-slash when joining paths
  return url.replace(/\/+$/, "");
}
