import type {
  StreamStatusPayload,
  TwitchLiveStream,
} from '../interfaces/index.js';

export const streamStatusPayloadOf = (
  stream: TwitchLiveStream,
): StreamStatusPayload => {
  return {
    stream_id: stream.stream_id,
    title: stream.title,
    game_id: stream.game_id,
    game_name: stream.game_name,
    viewer_count: stream.viewer_count,
    started_at: stream.started_at,
  };
};
