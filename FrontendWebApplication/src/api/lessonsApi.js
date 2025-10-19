"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchLessons() {
  /** Fetch list of lessons. */
  try {
    const { data } = await httpClient.get(Endpoints.lessons());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function fetchLessonDetail(id) {
  /** Fetch specific lesson details by id. */
  try {
    const { data } = await httpClient.get(Endpoints.lessonById(id));
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function submitQuiz(id, answers) {
  /** Submit quiz answers for a lesson. */
  try {
    const { data } = await httpClient.post(Endpoints.lessonQuiz(id), { answers });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getProgress() {
  /** Fetch overall learning progress. */
  try {
    const { data } = await httpClient.get(Endpoints.progress());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}
