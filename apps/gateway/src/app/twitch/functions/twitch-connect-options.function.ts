import { ADMIN_PATHS } from '../../admin/constants/index.js';
import type { OAuthConnectOptions } from '../../admin/interfaces/index.js';
import { TWITCH_CONNECT, TWITCH_COOKIES } from '../constants/index.js';
import type { TwitchAdminConfig } from '../interfaces/index.js';

export const twitchConnectOptions = (
  config: TwitchAdminConfig,
): OAuthConnectOptions => {
  return {
    label: TWITCH_CONNECT.LABEL,
    cookie: TWITCH_COOKIES.STATE,
    path: ADMIN_PATHS.TWITCH,
    connectPath: ADMIN_PATHS.TWITCH_CONNECT,
    redirectUri: config.redirectUri,
  };
};
