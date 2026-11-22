import type {
  TwitchClip as ProtoTwitchClip,
  TwitchVideo as ProtoTwitchVideo,
} from '@toxictoast/contracts-grpc';
import type { Clip, Video } from '@toxictoast/twitch-domain';
import { VIDEO_TYPE_TO_PROTO } from '../constants/index.js';

export class TwitchMediaGrpcMapper {
  toClip(clip: Clip): ProtoTwitchClip {
    return {
      clip_id: clip.clip_id,
      channel_id: clip.channel_id,
      url: clip.url,
      title: clip.title,
      creator_id: clip.creator_id,
      creator_name: clip.creator_name,
      duration_seconds: clip.duration_seconds,
      thumbnail_url: clip.thumbnail_url,
      vod_id: clip.vod_id ?? undefined,
      vod_offset: clip.vod_offset ?? undefined,
      created_at: clip.created_at.toISOString(),
    };
  }

  toVideo(video: Video): ProtoTwitchVideo {
    return {
      video_id: video.video_id,
      channel_id: video.channel_id,
      stream_id: video.stream_id ?? undefined,
      type: VIDEO_TYPE_TO_PROTO[video.type],
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      duration_seconds: video.duration_seconds,
      language: video.language,
      created_at: video.created_at.toISOString(),
      published_at: video.published_at.toISOString(),
    };
  }
}
