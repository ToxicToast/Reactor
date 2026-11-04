import type { PayloadReader } from '@toxictoast/shared-kernel';
import { TWITCH_DISCORD } from '../constants/index.js';

/** Anonyme Cheers und Gifts haben keinen Namen. */
export const viewerName = (payload: PayloadReader): string => {
  return payload.nullableString('user_name') ?? TWITCH_DISCORD.ANONYMOUS;
};
