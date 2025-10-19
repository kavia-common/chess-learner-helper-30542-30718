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
export async function fetchAnalysis(gameId) {
  /** Fetch post-game analysis by game id. */
  try {
    const { data } = await httpClient.get(Endpoints.analysis(gameId));
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}
