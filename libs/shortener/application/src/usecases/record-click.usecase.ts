import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import {
  classifyClick,
  type LinkClickRepository,
} from '@toxictoast/shortener-domain';
import type { RecordClickInput, RecordClickOutput } from '../data/index.js';

export class RecordClickUseCase implements UseCase<
  RecordClickInput,
  RecordClickOutput
> {
  constructor(private readonly clicks: LinkClickRepository) {}

  async execute(input: RecordClickInput): Promise<Result<RecordClickOutput>> {
    const recorded = await this.clicks.record(classifyClick(input));
    return Result.ok({ recorded });
  }
}
