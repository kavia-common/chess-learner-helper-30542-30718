import { useMemo } from 'react';
import { useUser as useUserContext, UserProvider } from '../user';

/**
 * PUBLIC_INTERFACE
 * useUser
 * Hook exposing memoized user state selectors and actions.
 *
 * Returns:
 * - state: { profile, avatar, settings, accountDeletion }
 * - actions: { fetchProfile, updateProfile, uploadAvatar, fetchSettings, updateSettings, deleteAccount }
 *
 * Note: Must be used within <UserProvider>.
 */
export function useUser() {
  const ctx = useUserContext();
  const state = ctx?.state || {};
  const actions = ctx?.actions || {};

  const selectors = useMemo(
    () => ({
      profile: state.profile,
      avatar: state.avatar,
      settings: state.settings,
      accountDeletion: state.accountDeletion,
    }),
    [state.profile, state.avatar, state.settings, state.accountDeletion]
  );

  return useMemo(
    () => ({
      state: selectors,
      actions,
    }),
    [selectors, actions]
  );
}

export default useUser;
export { UserProvider };
