"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchHistory(params = {}) {
  /** Fetch game history with optional pagination/filter params. */
  try {
    const { data } = await httpClient.get(Endpoints.history(), { params });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function listHistory({ page = 1, pageSize = 10, result = "all" } = {}) {
  /**
   * List history items with pagination and optional result filter.
   * Returns: { items, total, page, pageSize }
   */
  try {
    const { data } = await httpClient.get(Endpoints.history(), {
      params: { page, pageSize, result },
    });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getGameById(id) {
  /** Get a specific game by id. */
  try {
    const { data } = await httpClient.get(Endpoints.gameById(id));
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getHintForPosition({ gameId, plyIndex }) {
  /** Get a hint for a specific position in a game. */
  try {
    const { data } = await httpClient.get(`${Endpoints.gameById(gameId)}/hint`, {
      params: { plyIndex },
    });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchAnalysis(gameId) {
  /** Fetch post-game analysis by game id. */
  try {
    const { data } = await httpClient.get(Endpoints.analysis(gameId));
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getAnalysisForGame(gameId) {
  /** Alias for fetchAnalysis for store compatibility. */
  return fetchAnalysis(gameId);
}
