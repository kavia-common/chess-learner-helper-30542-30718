import { useMemo } from 'react';
import * as userApi from '../../api/userApi';

/**
 * PUBLIC_INTERFACE
 * useUser
 * Provides user helpers bound to API. No store context found, so we surface actions only.
 */
export default function useUser() {
  const actions = useMemo(
    () => ({
      fetchUserProfile: userApi.fetchUserProfile,
      getProfile: userApi.getProfile,
      updateProfile: userApi.updateProfile,
      uploadAvatar: userApi.uploadAvatar,
      getSettings: userApi.getSettings,
      updateSettings: userApi.updateSettings,
      deleteAccount: userApi.deleteAccount,
    }),
    []
  );

  return actions;
}
