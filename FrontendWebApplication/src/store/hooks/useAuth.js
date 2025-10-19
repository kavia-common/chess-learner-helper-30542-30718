import { useCallback, useMemo } from 'react';
import { useStore, authActions } from '..';

/**
 * PUBLIC_INTERFACE
 * useAuth
 * A consolidated hook that exposes memoized auth state selectors and bound action creators.
 *
 * Returns:
 * - state: { isAuthenticated, user, token, loading, error }
 * - actions: { login({ email, password }), logout(), register({ email, password }), refresh() }
 */
export function useAuth() {
  const { state, dispatch } = useStore();

  const selectors = useMemo(() => {
    const auth = state?.auth || {};
    return {
      isAuthenticated: !!auth.isAuthenticated,
      user: auth.user || null,
      token: auth.token || null,
      loading: !!auth.loading,
      error: auth.error || null,
    };
  }, [state?.auth]);

  const actions = useMemo(
    () => ({
      login: authActions.login(dispatch),
      logout: authActions.logout(dispatch),
      register: authActions.register(dispatch),
      refresh: authActions.refresh(dispatch),
    }),
    [dispatch]
  );

  // Stable API shape
  const api = useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );

  return api;
}

export default useAuth;
