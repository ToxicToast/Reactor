import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  YouTubeChannelAnemic,
  YouTubeChannelRepository,
} from '@toxictoast/youtube-domain';

export class ListYouTubeChannelsUseCase implements UseCase<
  void,
  Array<YouTubeChannelAnemic>
> {
  constructor(private readonly repository: YouTubeChannelRepository) {}

  async execute(): Promise<Result<Array<YouTubeChannelAnemic>>> {
    return Result.ok(await this.repository.findList());
  }
}
