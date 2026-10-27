import type { ApiClient } from '@twurple/api';
import type { AuthProvider } from '@twurple/auth';

export const createTwitchApiClient = async (
  authProvider: AuthProvider,
): Promise<ApiClient> => {
  const api = await import('@twurple/api');
  return new api.ApiClient({ authProvider });
};
