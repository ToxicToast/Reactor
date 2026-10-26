import { Result, ValidationError } from '@toxictoast/shared-kernel';
import type { TwitchChannelData } from '../data/index.js';

const TWITCH_ID = /^\d+$/;
const LOGIN = /^[a-z0-9_]{1,25}$/;

export const normalizeTwitchChannelData = (
  data: TwitchChannelData,
): Result<TwitchChannelData> => {
  const twitchId = data.twitch_id.trim();
  if (!TWITCH_ID.test(twitchId)) {
    return Result.fail(
      new ValidationError(`Invalid twitch id ${data.twitch_id}`),
    );
  }

  const login = data.login.trim().toLowerCase();
  if (!LOGIN.test(login)) {
    return Result.fail(
      new ValidationError(`Invalid twitch login ${data.login}`),
    );
  }

  const displayName = data.display_name.trim();
  if (displayName.length === 0) {
    return Result.fail(new ValidationError('Display name must not be empty'));
  }

  const scopes = [...new Set(data.scopes.map((scope) => scope.trim()))]
    .filter((scope) => scope.length > 0)
    .sort();

  return Result.ok({
    twitch_id: twitchId,
    login,
    display_name: displayName,
    scopes,
  });
};
