import {
  TwitchClipEvents,
  TwitchTopics,
  TwitchVideoEvents,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';
import { MediaChangeKinds } from '@toxictoast/twitch-application';
import { clipOf } from '../functions/clip-of.function.js';
import { videoOf } from '../functions/video-of.function.js';
import type { MediaChangeMapper } from '../types/index.js';

const clipChange: MediaChangeMapper = (payload) => {
  return { kind: MediaChangeKinds.CLIP, clip: clipOf(payload) };
};

const videoChange: MediaChangeMapper = (payload) => {
  return { kind: MediaChangeKinds.VIDEO, video: videoOf(payload) };
};

export const MEDIA_CHANGE_MAPPERS: Readonly<Record<string, MediaChangeMapper>> =
  {
    ...Object.fromEntries(
      Object.values(TwitchClipEvents).map((name) => {
        return [eventKey(TwitchTopics.CLIP, name), clipChange];
      }),
    ),
    ...Object.fromEntries(
      Object.values(TwitchVideoEvents).map((name) => {
        return [eventKey(TwitchTopics.VIDEO, name), videoChange];
      }),
    ),
  };
