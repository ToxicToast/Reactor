import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { Clip, ClipRepository } from '@toxictoast/twitch-domain';
import type { ListClipsInput } from '../data/index.js';
import { clampLimit } from '../functions/index.js';

export class ListClipsUseCase implements UseCase<ListClipsInput, Array<Clip>> {
  constructor(private readonly clips: ClipRepository) {}

  async execute(input: ListClipsInput): Promise<Result<Array<Clip>>> {
    return Result.ok(
      await this.clips.list(
        { channel_id: input.channel_id, vod_id: input.vod_id ?? null },
        clampLimit(input.limit),
        input.offset,
      ),
    );
  }
}
