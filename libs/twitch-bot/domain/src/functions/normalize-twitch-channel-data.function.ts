import { normalizeScopes, Result } from '@toxictoast/shared-kernel';
import type { TwitchChannelData } from '../data/index.js';
import { normalizeTwitchIdentity } from './normalize-twitch-identity.function.js';

export const normalizeTwitchChannelData = (
  data: TwitchChannelData,
): Result<TwitchChannelData> => {
  const identity = normalizeTwitchIdentity(data);
  if (identity.isFailure) {
    return Result.fail(identity.error);
  }

  return Result.ok({ ...identity.value, scopes: normalizeScopes(data.scopes) });
};
