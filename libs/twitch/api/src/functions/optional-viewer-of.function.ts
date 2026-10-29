import type { Nullable } from '@toxictoast/shared-types';
import type { ViewerRef } from '@toxictoast/twitch-domain';
import type { PayloadReader } from '@toxictoast/shared-kernel';
import { viewerOf } from './viewer-of.function.js';

/** Anonyme Cheers und Gifts haben keinen Zuschauer. */
export const optionalViewerOf = (
  payload: PayloadReader,
): Nullable<ViewerRef> => {
  return payload.nullableString('user_id') === null ? null : viewerOf(payload);
};
