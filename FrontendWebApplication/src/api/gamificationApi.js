"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchAchievements() {
  /** Fetch achievements and progress. */
  try {
    const { data } = await httpClient.get(Endpoints.achievements());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchLeaderboards(params = {}) {
  /** Fetch leaderboards with optional params (e.g., period). */
  try {
    const { data } = await httpClient.get(Endpoints.leaderboards(), { params });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchDailyChallenge() {
  /** Fetch the daily challenge. */
  try {
    const { data } = await httpClient.get(Endpoints.dailyChallenge());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchPuzzles(params = {}) {
  /** Fetch paginated puzzles with filters. */
  try {
    const { data } = await httpClient.get(Endpoints.puzzles(), { params });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}
