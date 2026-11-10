import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { LiveChannel } from '../interfaces/index.js';
import type { LiveStatusReader } from '../services/index.js';

export class GetLiveStatusUseCase implements UseCase<void, Array<LiveChannel>> {
  constructor(private readonly reader: LiveStatusReader) {}

  async execute(): Promise<Result<Array<LiveChannel>>> {
    return Result.ok(await this.reader.read());
  }
}
