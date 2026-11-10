import type { WatchEventsRequest } from '@toxictoast/contracts-grpc';
import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';
import { parseChannelId } from './parse-channel-id.function.js';

export const eventFilterOf = (
  request: WatchEventsRequest,
): ((event: RecordedTwitchEvent) => boolean) => {
  const channelId = request.channel_id
    ? parseChannelId(request.channel_id)
    : undefined;
  const topics = new Set(request.topics);

  return (event) => {
    return (
      (channelId === undefined || event.channel_id === channelId) &&
      (topics.size === 0 || topics.has(event.topic))
    );
  };
};
