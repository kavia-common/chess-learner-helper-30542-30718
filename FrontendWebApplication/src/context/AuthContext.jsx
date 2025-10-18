import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides authentication state and actions to the app.
   * Persists token in localStorage and keeps a basic user object.
   */
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jwt') || null);
  const navigate = useNavigate?.() || (() => {});
  const location = useLocation?.() || { state: null };

  useEffect(() => {
    if (token && !user) {
      // Attempt to fetch profile with saved token (stubbed for now).
      authService.getProfile(token)
        .then((u) => setUser(u))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('jwt');
        });
    }
  }, [token, user]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res?.token) {
      localStorage.setItem('jwt', res.token);
      setToken(res.token);
      setUser(res.user || { email, role: res.role || 'user' });
      const from = location?.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    return res;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
    authService.logout();
    navigate('/', { replace: true });
  };

  const value = useMemo(() => ({ user, token, login, logout, register, setUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  return useContext(AuthContext) || { user: null, token: null, login: async () => {}, logout: () => {} };
}
