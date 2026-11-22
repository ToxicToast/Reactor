import { Result, ValidationError } from '@toxictoast/shared-kernel';
import { TWITCH_CHANNEL_PATTERNS } from '../constants/index.js';
import type { TwitchChannelData } from '../data/index.js';

export const normalizeTwitchChannelData = (
  data: TwitchChannelData,
): Result<TwitchChannelData> => {
  const twitchId = data.twitch_id.trim();
  if (!TWITCH_CHANNEL_PATTERNS.TWITCH_ID.test(twitchId)) {
    return Result.fail(
      new ValidationError(`Invalid twitch id ${data.twitch_id}`),
    );
  }

  const login = data.login.trim().toLowerCase();
  if (!TWITCH_CHANNEL_PATTERNS.LOGIN.test(login)) {
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
