import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { PublishTwitchEventInput } from '../data/index.js';
import { observe } from '../functions/index.js';

export class PublishTwitchEventUseCase implements UseCase<
  PublishTwitchEventInput,
  void
> {
  constructor(
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(input: PublishTwitchEventInput): Promise<Result<void>> {
    const event = observe(
      this.ctx,
      input.channel,
      input.topic,
      input.name,
      input.payload,
    );
    await this.uow.run(() => this.outbox.add([event]));
    return Result.ok();
  }
}
