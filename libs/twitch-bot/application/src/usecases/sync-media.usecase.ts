import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { SyncMediaOutput } from '../data/index.js';
import type { ImportMediaUseCase } from './import-media.usecase.js';
import type { SyncClipsUseCase } from './sync-clips.usecase.js';
import type { SyncVideosUseCase } from './sync-videos.usecase.js';

export class SyncMediaUseCase implements UseCase<void, SyncMediaOutput> {
  constructor(
    private readonly importMedia: ImportMediaUseCase,
    private readonly syncClips: SyncClipsUseCase,
    private readonly syncVideos: SyncVideosUseCase,
  ) {}

  async execute(): Promise<Result<SyncMediaOutput>> {
    const imported = await this.importMedia.execute();
    if (imported.isFailure) {
      return Result.fail(imported.error);
    }
    const clips = await this.syncClips.execute();
    if (clips.isFailure) {
      return Result.fail(clips.error);
    }
    const videos = await this.syncVideos.execute();
    if (videos.isFailure) {
      return Result.fail(videos.error);
    }

    return Result.ok({
      imported_clips: imported.value.clips,
      imported_videos: imported.value.videos,
      created_clips: clips.value.created,
      created_videos: videos.value.created,
    });
  }
}
