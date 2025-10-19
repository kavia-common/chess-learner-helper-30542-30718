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
 export async function completeDailyChallenge(id) {
   /** Mark the daily challenge as completed and return result (e.g., points awarded). */
   try {
     const { data } = await httpClient.post(Endpoints.dailyChallengeComplete(id));
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

 // Backward-compatible alias if other parts import getPuzzles
 export const getPuzzles = fetchPuzzles;

 // PUBLIC_INTERFACE
 export async function submitPuzzleSolution(puzzleId, solution) {
   /**
    * Submit a puzzle solution.
    * Request body shape kept simple: { solution }
    */
   try {
     const { data } = await httpClient.post(`${Endpoints.puzzles()}/${puzzleId}/submit`, { solution });
     return data;
   } catch (e) {
     throw normalizeError(e);
   }
 }

 // Backward-compatible aliases for consistency with store usage that may vary
 export const getLeaderboards = fetchLeaderboards;
 export const getAchievements = fetchAchievements;
