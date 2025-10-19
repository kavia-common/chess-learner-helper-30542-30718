import { useMemo } from 'react';
import { useStore, authActions } from '..';

/**
 * PUBLIC_INTERFACE
 * useAuth
 * A consolidated hook that exposes memoized auth state and bound action creators.
 *
 * Exposes: isAuthenticated, user, token, loading, error, login, logout, register, refresh
 */
export default function useAuth() {
  const { state, dispatch } = useStore();

  // Select and memoize the sub-state we care about
  const { isAuthenticated, user, token, loading, error } = useMemo(() => {
    const auth = state?.auth || {};
    return {
      isAuthenticated: !!auth.isAuthenticated,
      user: auth.user || null,
      token: auth.token || null,
      loading: !!auth.loading,
      error: auth.error || null,
    };
  }, [state?.auth]);

  // Bind actions with stable identity
  const { login, logout, register, refresh } = useMemo(
    () => ({
      login: authActions.login(dispatch),
      logout: authActions.logout(dispatch),
      register: authActions.register(dispatch),
      refresh: authActions.refresh(dispatch),
    }),
    [dispatch]
  );

  return {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    refresh,
  };
}
