"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchGames() {
  /** Fetch list of games for the user. */
  try {
    const { data } = await httpClient.get(Endpoints.games());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function startAIGame(level) {
  /** Start a new AI game with specified difficulty level. */
  try {
    const { data } = await httpClient.post(Endpoints.aiPlay(), { level });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function requestMatchmaking(preferences = {}) {
  /** Request matchmaking for realtime game. */
  try {
    const { data } = await httpClient.post(Endpoints.matchmaking(), preferences);
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function pollMatchmaking(ticketId) {
  /** Poll matchmaking status for a given ticketId. */
  try {
    const { data } = await httpClient.get(`${Endpoints.matchmaking()}/${encodeURIComponent(ticketId)}`);
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function cancelMatchmaking(ticketId) {
  /** Cancel matchmaking for a given ticketId. */
  try {
    const { data } = await httpClient.delete(`${Endpoints.matchmaking()}/${encodeURIComponent(ticketId)}`);
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getGameState(gameId) {
  /** Retrieve the current realtime game state by id. */
  try {
    const { data } = await httpClient.get(Endpoints.gameById(gameId));
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}
