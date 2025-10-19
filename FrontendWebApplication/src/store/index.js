import React, { createContext, useContext } from 'react';

// PUBLIC_INTERFACE
export const initialState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  ui: {
    theme: 'light',
    notifications: []
  }
};

// Action types can be expanded later
const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TOGGLE_THEME: 'TOGGLE_THEME',
  NOTIFY: 'NOTIFY',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// PUBLIC_INTERFACE
export function rootReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return { ...state, auth: { ...state.auth, isAuthenticated: true, user: action.payload?.user || null } };
    case ACTIONS.LOGOUT:
      return { ...state, auth: { isAuthenticated: false, user: null, token: null } };
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

// Export actions for future use
export const StoreActions = ACTIONS;
