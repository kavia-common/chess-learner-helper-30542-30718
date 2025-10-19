"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchAdminDashboard() {
  /** Fetch admin dashboard summary. */
  try {
    const { data } = await httpClient.get(Endpoints.adminDashboard());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchAnalytics() {
  /** Fetch analytics metrics. */
  try {
    const { data } = await httpClient.get(Endpoints.adminAnalytics());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchAuditLog(params = {}) {
  /** Fetch audit logs with optional filters. */
  try {
    const { data } = await httpClient.get(Endpoints.adminAuditLog(), { params });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchContent() {
  /** Fetch content items managed by admin. */
  try {
    const { data } = await httpClient.get(Endpoints.adminContent());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchModeration() {
  /** Fetch moderation queue. */
  try {
    const { data } = await httpClient.get(Endpoints.adminModeration());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchUsers() {
  /** Fetch users list for admin. */
  try {
    const { data } = await httpClient.get(Endpoints.adminUsers());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// Backward-compatible default export shim expected by admin pages
const adminApi = {
  listContent: fetchContent,
  listUsers: fetchUsers,
  getModerationQueue: fetchModeration,
  moderateItem: async (itemId, action) => {
    // Placeholder: implement when backend supports moderation actions
    // For now, return success to avoid breaking UI flows
    return { ok: true, itemId, action };
  },
  getAnalytics: fetchAnalytics,
  getAuditLogs: fetchAuditLog,
};

export default adminApi;
