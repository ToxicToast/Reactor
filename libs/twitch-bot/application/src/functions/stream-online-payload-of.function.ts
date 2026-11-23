import type {
  StreamOnlinePayload,
  TwitchLiveStream,
} from '../interfaces/index.js';

export const streamOnlinePayloadOf = (
  stream: TwitchLiveStream,
): StreamOnlinePayload => {
  return {
    stream_id: stream.stream_id,
    type: stream.type,
    started_at: stream.started_at,
  };
};
