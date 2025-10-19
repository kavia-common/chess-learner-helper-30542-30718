import React, { createContext, useContext } from 'react';
import * as AuthApi from '../api/authApi';

// PUBLIC_INTERFACE
export const initialState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  ui: {
    theme: 'light',
    notifications: []
  }
};

// Action types can be expanded later
const ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  REFRESH_START: 'REFRESH_START',
  REFRESH_SUCCESS: 'REFRESH_SUCCESS',
  REFRESH_ERROR: 'REFRESH_ERROR',
  TOGGLE_THEME: 'TOGGLE_THEME',
  NOTIFY: 'NOTIFY',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// PUBLIC_INTERFACE
export function rootReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN_START:
    case ACTIONS.REGISTER_START:
    case ACTIONS.REFRESH_START:
      return { ...state, auth: { ...state.auth, loading: true, error: null } };
    case ACTIONS.LOGIN_SUCCESS:
    case ACTIONS.REFRESH_SUCCESS:
      return { ...state, auth: { ...state.auth, loading: false, isAuthenticated: true, user: action.payload?.user || null, token: action.payload?.token || null, error: null } };
    case ACTIONS.REGISTER_SUCCESS:
      return { ...state, auth: { ...state.auth, loading: false, error: null }, ui: { ...state.ui } };
    case ACTIONS.LOGIN_ERROR:
    case ACTIONS.REGISTER_ERROR:
    case ACTIONS.REFRESH_ERROR:
      return { ...state, auth: { ...state.auth, loading: false, error: action.payload || 'Error' } };
    case ACTIONS.LOGOUT:
      // Clear session
      return { ...state, auth: { isAuthenticated: false, user: null, token: null, loading: false, error: null } };
    case ACTIONS.TOGGLE_THEME:
      return { ...state, ui: { ...state.ui, theme: state.ui.theme === 'light' ? 'dark' : 'light' } };
    case ACTIONS.NOTIFY:
      return { ...state, ui: { ...state.ui, notifications: [...state.ui.notifications, action.payload] } };
    case ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, ui: { ...state.ui, notifications: [] } };
    default:
      return state;
  }
}

const StoreContext = createContext({ state: initialState, dispatch: () => {} });

// PUBLIC_INTERFACE
export function StoreProvider({ value, children }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// PUBLIC_INTERFACE
export function useStore() {
  return useContext(StoreContext);
}

// PUBLIC_INTERFACE
export const StoreActions = ACTIONS;

/**
 * PUBLIC_INTERFACE
 * authActions: helper async action creators to integrate with components.
 */
export const authActions = {
  // PUBLIC_INTERFACE
  login: (dispatch) => async ({ email, password }) => {
    dispatch({ type: ACTIONS.LOGIN_START });
    try {
      const data = await AuthApi.login(email, password);
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: data });
      return data;
    } catch (e) {
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: e.message || String(e) });
      throw e;
    }
  },
  // PUBLIC_INTERFACE
  logout: (dispatch) => async () => {
    try {
      await AuthApi.logout();
    } finally {
      dispatch({ type: ACTIONS.LOGOUT });
    }
  },
  // PUBLIC_INTERFACE
  register: (dispatch) => async ({ email, password }) => {
    dispatch({ type: ACTIONS.REGISTER_START });
    try {
      const data = await AuthApi.register({ email, password });
      dispatch({ type: ACTIONS.REGISTER_SUCCESS, payload: data });
      return data;
    } catch (e) {
      dispatch({ type: ACTIONS.REGISTER_ERROR, payload: e.message || String(e) });
      throw e;
    }
  },
  // PUBLIC_INTERFACE
  refresh: (dispatch) => async () => {
    dispatch({ type: ACTIONS.REFRESH_START });
    try {
      const data = await AuthApi.getCurrentUser();
      if (data && (data.user || data.email)) {
        dispatch({ type: ACTIONS.REFRESH_SUCCESS, payload: { user: data.user || data, token: data.token } });
      } else {
        dispatch({ type: ACTIONS.REFRESH_ERROR, payload: 'No active session' });
      }
      return data;
    } catch (e) {
      dispatch({ type: ACTIONS.REFRESH_ERROR, payload: e.message || String(e) });
      return null;
    }
  }
};

export * from './hooks';
