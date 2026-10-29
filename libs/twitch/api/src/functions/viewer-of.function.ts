import type { ViewerRef } from '@toxictoast/twitch-domain';
import type { PayloadReader } from '@toxictoast/shared-kernel';

export const viewerOf = (payload: PayloadReader): ViewerRef => {
  return {
    user_id: payload.string('user_id'),
    user_login: payload.string('user_login'),
    user_name: payload.string('user_name'),
  };
};
