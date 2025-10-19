"use strict";

import { httpClient } from "./httpClient";
import { Endpoints } from "./endpoints";
import { normalizeError } from "../utils/errorHandler";

// PUBLIC_INTERFACE
export async function fetchUserProfile() {
  /** Fetch current user's profile. */
  try {
    const { data } = await httpClient.get(Endpoints.me());
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function updateProfile(payload) {
  /** Update user profile. */
  try {
    const { data } = await httpClient.put(Endpoints.users(), payload);
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function uploadAvatar(userId, file) {
  /** Upload avatar for a specific user. */
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await httpClient.post(Endpoints.uploadAvatar(userId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    throw normalizeError(e);
  }
}
