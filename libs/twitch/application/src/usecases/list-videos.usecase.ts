import type { UseCase } from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  StreamSessionRepository,
  Video,
  VideoRepository,
} from '@toxictoast/twitch-domain';
import type { ListVideosInput } from '../data/index.js';
import { clampLimit } from '../functions/index.js';

export class ListVideosUseCase implements UseCase<
  ListVideosInput,
  Array<Video>
> {
  constructor(
    private readonly videos: VideoRepository,
    private readonly sessions: StreamSessionRepository,
  ) {}

  async execute(input: ListVideosInput): Promise<Result<Array<Video>>> {
    let streamId: Nullable<string> = null;
    if (input.session_id) {
      const session = await this.sessions.findById(input.session_id);
      if (!session) {
        return Result.fail(new NotFoundError('Session', input.session_id));
      }
      streamId = session.stream_id;
    }

    return Result.ok(
      await this.videos.list(
        {
          channel_id: input.channel_id,
          type: input.type ?? null,
          stream_id: streamId,
        },
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
