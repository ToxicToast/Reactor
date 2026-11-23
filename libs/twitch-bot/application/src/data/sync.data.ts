import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';

export interface SyncChattersOutput {
  readonly joined: number;
  readonly left: number;
}

export interface SyncClipsOutput {
  readonly created: number;
}

export interface SyncVideosOutput {
  readonly created: number;
}

export interface SyncFollowersOutput {
  readonly followed: number;
  readonly unfollowed: number;
}

export interface ImportMediaOutput {
  readonly clips: number;
  readonly videos: number;
}

export interface SyncMediaOutput {
  readonly imported_clips: number;
  readonly imported_videos: number;
  readonly created_clips: number;
  readonly created_videos: number;
}

export interface RefreshArchiveInput {
  readonly channel: TrackedChannel;
}

export interface SyncStreamsOutput {
  /** Channels, die gerade live sind (eigene und Freunde) */
  readonly live: number;
  readonly online: number;
  readonly offline: number;
}
