"use strict";

import axios from "axios";
import { getEnv } from "../utils/env";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

/**
 * Axios HTTP client with:
 * - Base URL from env
 * - withCredentials for cookie-based auth
 * - Request interceptor adds CSRF header if present
 * - Response interceptor handles 401 by attempting refresh once
 * - Normalized error handling across the app
 */

// Simple in-memory token placeholders if using bearer tokens in the future
let accessToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

export function setAccessToken(token) {
  accessToken = token || null;
}

const { apiBaseUrl } = getEnv();

export const httpClient = axios.create({
  baseURL: apiBaseUrl || undefined,
  withCredentials: true, // allow cookie-based sessions (secure, httpOnly)
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Retrieve CSRF token if cookie-based CSRF protection is used.
 * Hook point: integrate framework-specific token retrieval here.
 */
function getCsrfToken() {
  // Placeholder: read from cookie "XSRF-TOKEN" if server sets it
  // For now, return null to avoid sending an empty header
  // Example:
  // const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN=([^;]+)/);
  // return match ? decodeURIComponent(match[2]) : null;
  return null;
}

// Request interceptor: attach Authorization and CSRF headers
httpClient.interceptors.request.use(
  (config) => {
    const cfg = { ...config };
    if (accessToken) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${accessToken}`;
    }
    const csrf = getCsrfToken();
    if (csrf) {
      cfg.headers = cfg.headers || {};
      cfg.headers["X-CSRF-Token"] = csrf;
    }
    return cfg;
  },
  (error) => Promise.reject(normalizeError(error))
);

// Response interceptor: handle 401 by attempting token refresh once
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // Normalize first so consuming code always gets the same shape
    const norm = normalizeError(error);

    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Prevent infinite loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              delete originalRequest.headers.Authorization;
            }
            httpClient
              .request(originalRequest)
              .then(resolve)
              .catch((err) => reject(normalizeError(err)));
          });
        });
      }

      isRefreshing = true;
      try {
        // Attempt refresh using cookie session or refresh token endpoint
        await axios.post(
          Endpoints.refresh(),
          {},
          { withCredentials: true, headers: { Accept: "application/json" } }
        );
        // If server sets new session cookie, we don't need accessToken.
        // If server returns a new access token, set it here:
        // const newToken = resp.data?.accessToken; setAccessToken(newToken);

        onRefreshed(accessToken);
        isRefreshing = false;

        // Retry original request
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        } else if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return httpClient.request(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshed(null); // Unblock queued requests with no token
        // If refresh failed, bubble up normalized error
        throw normalizeError(refreshErr);
      }
    }

    // Not a refresh scenario, reject normalized error
    throw norm;
  }
);
