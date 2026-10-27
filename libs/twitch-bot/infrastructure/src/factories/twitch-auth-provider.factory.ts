import type {
  AccessToken,
  RefreshingAuthProvider,
  StaticAuthProvider,
} from '@twurple/auth';
import type { TwitchConfig } from '../interfaces/index.js';

export const createTwitchAuthProvider = async (
  config: TwitchConfig,
): Promise<RefreshingAuthProvider> => {
  const auth = await import('@twurple/auth');
  return new auth.RefreshingAuthProvider({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  });
};

export const createStaticAuthProvider = async (
  clientId: string,
  token: AccessToken,
): Promise<StaticAuthProvider> => {
  const auth = await import('@twurple/auth');
  return new auth.StaticAuthProvider(clientId, token);
};

export const requestAppToken = async (
  config: TwitchConfig,
): Promise<AccessToken> => {
  const auth = await import('@twurple/auth');
  return auth.getAppToken(config.clientId, config.clientSecret);
};
