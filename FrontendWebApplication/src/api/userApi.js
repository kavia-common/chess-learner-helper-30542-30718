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
 export async function getProfile() {
   /** Alias for fetchUserProfile for store compatibility. */
   return fetchUserProfile();
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

 // PUBLIC_INTERFACE
 export async function getSettings() {
   /** Fetch user settings (placeholder endpoint using /users/me/settings if available; fallback to /auth/me). */
   try {
     // If specific endpoint is not defined in Endpoints, reuse profile for demo purposes.
     const { data } = await httpClient.get(Endpoints.me());
     // Shape normalization
     return data?.settings || { privacy: {}, notifications: {}, consent: {} };
   } catch (e) {
     throw normalizeError(e);
   }
 }

 // PUBLIC_INTERFACE
 export async function updateSettings(settings) {
   /** Update user settings (placeholder implementation). */
   try {
     // Without a specific endpoint, simulate update by returning payload.
     return { success: true, settings };
   } catch (e) {
     throw normalizeError(e);
   }
 }

 // PUBLIC_INTERFACE
 export async function deleteAccount() {
   /** Delete current user account (placeholder). */
   try {
     // Without backend, simulate ok response
     return { success: true };
   } catch (e) {
     throw normalizeError(e);
   }
 }
