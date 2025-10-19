import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';
import {
  getAuthToken,
  getCurrentUser,
  loginWithEmailPassword,
  registerWithEmailPassword,
  fetchMe,
  signOut as signOutSvc,
  setSession,
  clearSession,
} from '../services/authService';

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  /** Current authenticated user or null. */
  user: null,
  /** Boolean indicating whether auth is initializing (bootstrapping). */
  initializing: true,
  /** Login with email/password. */
  login: async (_email, _password) => {},
  /** Register with email/password. */
  register: async (_email, _password) => {},
  /** Logout current user. */
  logout: () => {},
  /** Update the stored user profile data. */
  updateUser: (_partial) => {},
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and helpers for the application. */
  const { showToast } = useToast();
  const [user, setUser] = useState(() => getCurrentUser());
  const [initializing, setInitializing] = useState(true);

  // Bootstrap session: if token exists but no user, attempt to fetch profile
  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        const token = getAuthToken();
        if (token && !user) {
          const me = await fetchMe();
          if (isMounted) setUser(me || null);
        }
      } catch {
        // Keep errors quiet to avoid leaking details on boot
      } finally {
        if (isMounted) setInitializing(false);
      }
    }
    bootstrap();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await loginWithEmailPassword(email, password);
      if (res?.user) setUser(res.user);
      showToast('Logged in successfully.', 'success', 2500);
      return res;
    } catch (err) {
      // Secure message
      showToast('Unable to log in. Please check your credentials and try again.', 'error', 4000);
      throw err;
    }
  }, [showToast]);

  const register = useCallback(async (email, password) => {
    try {
      const res = await registerWithEmailPassword(email, password);
      if (res?.user) {
        setUser(res.user);
        showToast('Registration successful.', 'success', 2500);
      } else {
        // If verification flow, user may be null
        showToast('Registration submitted. Check your email to verify your account.', 'info', 4500);
      }
      return res;
    } catch (err) {
      showToast('Unable to register. Please try again.', 'error', 4000);
      throw err;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    try {
      signOutSvc();
      setUser(null);
      showToast('You have been signed out.', 'info', 2500);
    } catch {
      // no-op
    }
  }, [showToast]);

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(partial || {}) };
      // Keep storage in sync
      setSession({ token: getAuthToken(), user: next });
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    initializing,
    login,
    register,
    logout,
    updateUser,
  }), [user, initializing, login, register, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access authentication state and actions. */
  return useContext(AuthContext);
}
