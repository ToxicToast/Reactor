import { invalidArgument } from '@toxictoast/shared-grpc';
import { TWITCH_ID_PATTERN } from '../constants/index.js';

export const parseChannelId = (value: string, field = 'channel_id'): string => {
  if (!TWITCH_ID_PATTERN.test(value)) {
    throw invalidArgument(`${field} must be a twitch id`);
  }
  return value;
};
