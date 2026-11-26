import type { PostRef } from '@toxictoast/publisher-domain';

/** PostRef und AccountRef haben dieselbe Form; der Schlüssel gilt für beide */
export const refKey = (ref: PostRef): string => {
  return `${ref.platform}:${ref.remote_id}`;
};
