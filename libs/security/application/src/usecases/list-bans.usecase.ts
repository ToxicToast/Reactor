import type { UseCase } from '@toxictoast/shared-application';
import type { IpBanAnemic, IpBanRepository } from '@toxictoast/security-domain';
import { Result, type Clock } from '@toxictoast/shared-kernel';
import type { ListBansInput } from '../data/index.js';

export class ListBansUseCase implements UseCase<
  ListBansInput,
  Array<IpBanAnemic>
> {
  constructor(
    private readonly repository: IpBanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: ListBansInput): Promise<Result<Array<IpBanAnemic>>> {
    if (input.active_only) {
      return Result.ok(
        await this.repository.findActive(
          this.clock.now(),
          input.limit,
          input.offset,
        ),
      );
    }
    return Result.ok(await this.repository.findList(input.limit, input.offset));
  }
}
