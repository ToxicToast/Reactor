import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  normalizeIp,
  type IpBanAnemic,
  type IpBanFactory,
  type IpBanRepository,
} from '@toxictoast/security-domain';
import { NotFoundError, Result, type Clock } from '@toxictoast/shared-kernel';
import type { UnbanIpInput } from '../data/index.js';

export class UnbanIpUseCase implements UseCase<UnbanIpInput, IpBanAnemic> {
  constructor(
    private readonly factory: IpBanFactory,
    private readonly repository: IpBanRepository,
    private readonly persistence: DomainPersistence,
    private readonly clock: Clock,
  ) {}

  async execute(input: UnbanIpInput): Promise<Result<IpBanAnemic>> {
    const ip = normalizeIp(input.ip);
    const anemic = await this.repository.findActiveByIp(ip, this.clock.now());
    if (!anemic) {
      return Result.fail(new NotFoundError('Active ban', ip));
    }

    const ban = this.factory.reconstitute(anemic);
    const lifted = ban.lift(input.lifted_by);
    if (lifted.isFailure) {
      return Result.fail(lifted.error);
    }

    return this.persistence.persist(ban, this.repository);
  }
}
