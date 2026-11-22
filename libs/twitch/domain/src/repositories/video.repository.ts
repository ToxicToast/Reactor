import type { Optional } from '@toxictoast/shared-types';
import type { Video, VideoFilter } from '../interfaces/index.js';

export interface VideoRepository {
  /** legt das VOD an oder überschreibt es */
  save(video: Video): Promise<void>;
  list(
    filter: VideoFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Video>>;
}
