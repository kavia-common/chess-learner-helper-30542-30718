import React, { createContext, useContext, useMemo, useReducer } from 'react';
import * as UserApi from '../api/userApi';

const ACTIONS = {
  PROFILE_START: 'PROFILE_START',
  PROFILE_SUCCESS: 'PROFILE_SUCCESS',
  PROFILE_ERROR: 'PROFILE_ERROR',

  PROFILE_UPDATE_START: 'PROFILE_UPDATE_START',
  PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS',
  PROFILE_UPDATE_ERROR: 'PROFILE_UPDATE_ERROR',

  AVATAR_UPLOAD_START: 'AVATAR_UPLOAD_START',
  AVATAR_UPLOAD_SUCCESS: 'AVATAR_UPLOAD_SUCCESS',
  AVATAR_UPLOAD_ERROR: 'AVATAR_UPLOAD_ERROR',

  SETTINGS_START: 'SETTINGS_START',
  SETTINGS_SUCCESS: 'SETTINGS_SUCCESS',
  SETTINGS_ERROR: 'SETTINGS_ERROR',

  SETTINGS_UPDATE_START: 'SETTINGS_UPDATE_START',
  SETTINGS_UPDATE_SUCCESS: 'SETTINGS_UPDATE_SUCCESS',
  SETTINGS_UPDATE_ERROR: 'SETTINGS_UPDATE_ERROR',

  ACCOUNT_DELETE_START: 'ACCOUNT_DELETE_START',
  ACCOUNT_DELETE_SUCCESS: 'ACCOUNT_DELETE_SUCCESS',
  ACCOUNT_DELETE_ERROR: 'ACCOUNT_DELETE_ERROR',
};

const initialUserState = {
  profile: { data: null, loading: false, error: null, updating: false },
  avatar: { uploading: false, error: null },
  settings: { data: { privacy: {}, notifications: {}, consent: {} }, loading: false, error: null, updating: false },
  accountDeletion: { deleting: false, error: null, success: false },
};

// PUBLIC_INTERFACE
export function userReducer(state, action) {
  switch (action.type) {
    case ACTIONS.PROFILE_START:
      return { ...state, profile: { ...state.profile, loading: true, error: null } };
    case ACTIONS.PROFILE_SUCCESS:
      return { ...state, profile: { data: action.payload, loading: false, error: null, updating: false } };
    case ACTIONS.PROFILE_ERROR:
      return { ...state, profile: { ...state.profile, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.PROFILE_UPDATE_START:
      return { ...state, profile: { ...state.profile, updating: true, error: null } };
    case ACTIONS.PROFILE_UPDATE_SUCCESS:
      return { ...state, profile: { data: { ...(state.profile.data || {}), ...(action.payload || {}) }, loading: false, error: null, updating: false } };
    case ACTIONS.PROFILE_UPDATE_ERROR:
      return { ...state, profile: { ...state.profile, updating: false, error: action.payload || 'Error' } };

    case ACTIONS.AVATAR_UPLOAD_START:
      return { ...state, avatar: { uploading: true, error: null } };
    case ACTIONS.AVATAR_UPLOAD_SUCCESS:
      return {
        ...state,
        avatar: { uploading: false, error: null },
        profile: { ...state.profile, data: { ...(state.profile.data || {}), avatarUrl: action.payload?.url || '' } },
      };
    case ACTIONS.AVATAR_UPLOAD_ERROR:
      return { ...state, avatar: { uploading: false, error: action.payload || 'Error' } };

    case ACTIONS.SETTINGS_START:
      return { ...state, settings: { ...state.settings, loading: true, error: null } };
    case ACTIONS.SETTINGS_SUCCESS:
      return { ...state, settings: { data: action.payload || { privacy: {}, notifications: {}, consent: {} }, loading: false, error: null, updating: false } };
    case ACTIONS.SETTINGS_ERROR:
      return { ...state, settings: { ...state.settings, loading: false, error: action.payload || 'Error' } };

    case ACTIONS.SETTINGS_UPDATE_START:
      return { ...state, settings: { ...state.settings, updating: true, error: null } };
    case ACTIONS.SETTINGS_UPDATE_SUCCESS:
      return { ...state, settings: { data: { ...(state.settings.data || {}), ...(action.payload || {}) }, loading: false, error: null, updating: false } };
    case ACTIONS.SETTINGS_UPDATE_ERROR:
      return { ...state, settings: { ...state.settings, updating: false, error: action.payload || 'Error' } };

    case ACTIONS.ACCOUNT_DELETE_START:
      return { ...state, accountDeletion: { deleting: true, error: null, success: false } };
    case ACTIONS.ACCOUNT_DELETE_SUCCESS:
      return { ...state, accountDeletion: { deleting: false, error: null, success: true } };
    case ACTIONS.ACCOUNT_DELETE_ERROR:
      return { ...state, accountDeletion: { deleting: false, error: action.payload || 'Error', success: false } };

    default:
      return state;
  }
}

const UserContext = createContext({ state: initialUserState, actions: {} });

// PUBLIC_INTERFACE
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  const actions = useMemo(() => ({
    // PUBLIC_INTERFACE
    fetchProfile: async () => {
      dispatch({ type: ACTIONS.PROFILE_START });
      try {
        const profile = await UserApi.getProfile();
        dispatch({ type: ACTIONS.PROFILE_SUCCESS, payload: profile });
        return profile;
      } catch (e) {
        dispatch({ type: ACTIONS.PROFILE_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    updateProfile: async (payload) => {
      dispatch({ type: ACTIONS.PROFILE_UPDATE_START });
      try {
        const res = await UserApi.updateProfile(payload);
        dispatch({ type: ACTIONS.PROFILE_UPDATE_SUCCESS, payload: res.profile || payload });
        return res;
      } catch (e) {
        dispatch({ type: ACTIONS.PROFILE_UPDATE_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    uploadAvatar: async (file) => {
      dispatch({ type: ACTIONS.AVATAR_UPLOAD_START });
      try {
        const result = await UserApi.uploadAvatar(file);
        dispatch({ type: ACTIONS.AVATAR_UPLOAD_SUCCESS, payload: result });
        return result;
      } catch (e) {
        dispatch({ type: ACTIONS.AVATAR_UPLOAD_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    fetchSettings: async () => {
      dispatch({ type: ACTIONS.SETTINGS_START });
      try {
        const settings = await UserApi.getSettings();
        dispatch({ type: ACTIONS.SETTINGS_SUCCESS, payload: settings });
        return settings;
      } catch (e) {
        dispatch({ type: ACTIONS.SETTINGS_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    updateSettings: async (settings) => {
      dispatch({ type: ACTIONS.SETTINGS_UPDATE_START });
      try {
        const res = await UserApi.updateSettings(settings);
        dispatch({ type: ACTIONS.SETTINGS_UPDATE_SUCCESS, payload: settings });
        return res;
      } catch (e) {
        dispatch({ type: ACTIONS.SETTINGS_UPDATE_ERROR, payload: e.message });
        return null;
      }
    },
    // PUBLIC_INTERFACE
    deleteAccount: async () => {
      dispatch({ type: ACTIONS.ACCOUNT_DELETE_START });
      try {
        const res = await UserApi.deleteAccount();
        dispatch({ type: ACTIONS.ACCOUNT_DELETE_SUCCESS });
        return res;
      } catch (e) {
        dispatch({ type: ACTIONS.ACCOUNT_DELETE_ERROR, payload: e.message });
        return null;
      }
    },
  }), []);

  return <UserContext.Provider value={{ state, actions }}>{children}</UserContext.Provider>;
}

// PUBLIC_INTERFACE
export function useUser() {
  /** Hook to access user profile/settings state and actions */
  return useContext(UserContext);
}
