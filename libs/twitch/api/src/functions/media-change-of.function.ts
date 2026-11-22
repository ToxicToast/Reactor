import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { MediaChange } from '@toxictoast/twitch-application';
import { MEDIA_CHANGE_MAPPERS } from '../constants/media-change-mappers.constant.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { mapperFor } from './mapper-for.function.js';

export const mediaChangeOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
): Nullable<MediaChange> => {
  const mapper = mapperFor(MEDIA_CHANGE_MAPPERS, event);
  return mapper ? mapper(payload) : null;
};
