import type {
  ClipRepository,
  VideoRepository,
} from '@toxictoast/twitch-domain';
import { MediaChangeKinds } from '../constants/index.js';
import type { MediaChange } from '../types/index.js';

export class MediaRecorder {
  constructor(
    private readonly clips: ClipRepository,
    private readonly videos: VideoRepository,
  ) {}

  async record(change: MediaChange): Promise<void> {
    switch (change.kind) {
      case MediaChangeKinds.CLIP:
        return this.clips.save(change.clip);
      case MediaChangeKinds.VIDEO:
        return this.videos.save(change.video);
    }
  }
}
