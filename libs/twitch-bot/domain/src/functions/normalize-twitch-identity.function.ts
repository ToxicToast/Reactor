import { Result, ValidationError } from '@toxictoast/shared-kernel';
import { TWITCH_CHANNEL_PATTERNS } from '../constants/index.js';
import type { TwitchIdentity } from '../interfaces/index.js';
import { normalizeTwitchLogin } from './normalize-twitch-login.function.js';

export const normalizeTwitchIdentity = (
  data: TwitchIdentity,
): Result<TwitchIdentity> => {
  const twitchId = data.twitch_id.trim();
  if (!TWITCH_CHANNEL_PATTERNS.TWITCH_ID.test(twitchId)) {
    return Result.fail(
      new ValidationError(`Invalid twitch id ${data.twitch_id}`),
    );
  }

  const login = normalizeTwitchLogin(data.login);
  if (login.isFailure) {
    return Result.fail(login.error);
  }

  const displayName = data.display_name.trim();
  if (displayName.length === 0) {
    return Result.fail(new ValidationError('Display name must not be empty'));
  }

  return Result.ok({
    twitch_id: twitchId,
    login: login.value,
    display_name: displayName,
  });
};
