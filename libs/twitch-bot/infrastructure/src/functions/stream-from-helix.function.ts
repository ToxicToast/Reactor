import type { TwitchLiveStream } from '@toxictoast/twitch-bot-application';
import type { HelixStream } from '@twurple/api';

export const streamFromHelix = (stream: HelixStream): TwitchLiveStream => {
  return {
    twitch_id: stream.userId,
    stream_id: stream.id,
    type: stream.type,
    title: stream.title,
    game_id: stream.gameId,
    game_name: stream.gameName,
    viewer_count: stream.viewers,
    started_at: stream.startDate,
  };
};
