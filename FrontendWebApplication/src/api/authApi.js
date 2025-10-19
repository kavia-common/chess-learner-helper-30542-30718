"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Authenticate with email/password. */
  try {
    const { data } = await httpClient.post(Endpoints.login(), { email, password });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function register(userData) {
  /** Register a new user. */
  try {
    const { data } = await httpClient.post(Endpoints.register(), userData);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function logout() {
  /** Logout current user (cookie/session-based). */
  try {
    const { data } = await httpClient.post(Endpoints.logout(), {});
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function getCurrentUser() {
  /** Fetch current authenticated user. */
  try {
    const { data } = await httpClient.get(Endpoints.me());
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function requestPasswordReset(email) {
  /** Request a password reset email. */
  try {
    const { data } = await httpClient.post(Endpoints.forgotPassword(), { email });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function resetPassword(payload) {
  /** Reset password using token and new password. */
  try {
    const { data } = await httpClient.post(Endpoints.resetPassword(), payload);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function verifyEmail(token) {
  /** Verify email using verification token. */
  try {
    const { data } = await httpClient.post(Endpoints.verifyEmail(), { token });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

// PUBLIC_INTERFACE
export async function linkProvider(provider, payload = {}) {
  /** Link a social provider to the account (placeholder until backend is ready). */
  try {
    // If backend supports linking, this would be a POST to a specific endpoint:
    // return (await httpClient.post(`${Endpoints.linkAccounts()}/${provider}`, payload)).data;
    const { data } = await httpClient.post(Endpoints.linkAccounts(), { provider, ...payload });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}
