import { Result, ValidationError } from '@toxictoast/shared-kernel';
import { TWITCH_CHANNEL_PATTERNS } from '../constants/index.js';

export const normalizeTwitchLogin = (login: string): Result<string> => {
  const normalized = login.trim().toLowerCase();
  if (!TWITCH_CHANNEL_PATTERNS.LOGIN.test(normalized)) {
    return Result.fail(new ValidationError(`Invalid twitch login ${login}`));
  }
  return Result.ok(normalized);
};
