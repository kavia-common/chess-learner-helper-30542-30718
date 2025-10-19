"use strict";

import { getEnv } from "../utils/env";

const { apiBaseUrl } = getEnv();

function joinUrl(base, path) {
  if (!base) return path;
  const a = base.replace(/\/+$/, "");
  const b = String(path || "").replace(/^\/+/, "");
  return `${a}/${b}`;
}

// PUBLIC_INTERFACE
export const Endpoints = {
  // Auth
  login: () => joinUrl(apiBaseUrl, "/auth/login"),
  logout: () => joinUrl(apiBaseUrl, "/auth/logout"),
  register: () => joinUrl(apiBaseUrl, "/auth/register"),
  me: () => joinUrl(apiBaseUrl, "/auth/me"),
  refresh: () => joinUrl(apiBaseUrl, "/auth/refresh"),
  forgotPassword: () => joinUrl(apiBaseUrl, "/auth/forgot-password"),
  resetPassword: () => joinUrl(apiBaseUrl, "/auth/reset-password"),
  verifyEmail: () => joinUrl(apiBaseUrl, "/auth/verify-email"),
  oauthGoogle: () => joinUrl(apiBaseUrl, "/auth/oauth/google"),
  linkAccounts: () => joinUrl(apiBaseUrl, "/auth/link-accounts"),

  // Users
  users: () => joinUrl(apiBaseUrl, "/users"),
  userById: (id) => joinUrl(apiBaseUrl, `/users/${id}`),
  uploadAvatar: (id) => joinUrl(apiBaseUrl, `/users/${id}/avatar`),

  // Lessons
  lessons: () => joinUrl(apiBaseUrl, "/lessons"),
  lessonById: (id) => joinUrl(apiBaseUrl, `/lessons/${id}`),
  lessonQuiz: (id) => joinUrl(apiBaseUrl, `/lessons/${id}/quiz`),
  progress: () => joinUrl(apiBaseUrl, "/progress"),

  // Games
  games: () => joinUrl(apiBaseUrl, "/games"),
  gameById: (id) => joinUrl(apiBaseUrl, `/games/${id}`),
  matchmaking: () => joinUrl(apiBaseUrl, "/games/matchmaking"),
  aiPlay: () => joinUrl(apiBaseUrl, "/games/ai"),
  history: () => joinUrl(apiBaseUrl, "/history"),
  analysis: (id) => joinUrl(apiBaseUrl, `/history/${id}/analysis`),

  // Gamification
  achievements: () => joinUrl(apiBaseUrl, "/gamification/achievements"),
  leaderboards: () => joinUrl(apiBaseUrl, "/gamification/leaderboards"),
  dailyChallenge: () => joinUrl(apiBaseUrl, "/gamification/daily-challenge"),
  puzzles: () => joinUrl(apiBaseUrl, "/gamification/puzzles"),

  // Admin
  adminDashboard: () => joinUrl(apiBaseUrl, "/admin/dashboard"),
  adminAnalytics: () => joinUrl(apiBaseUrl, "/admin/analytics"),
  adminAuditLog: () => joinUrl(apiBaseUrl, "/admin/audit-log"),
  adminContent: () => joinUrl(apiBaseUrl, "/admin/content"),
  adminModeration: () => joinUrl(apiBaseUrl, "/admin/moderation"),
  adminUsers: () => joinUrl(apiBaseUrl, "/admin/users"),
};
