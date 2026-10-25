import { isIP } from 'node:net';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  normalizeIp,
  type BanPolicy,
  type IpBanFactory,
  type IpBanRepository,
} from '@toxictoast/security-domain';
import { Result, ValidationError, type Clock } from '@toxictoast/shared-kernel';
import type {
  RecordAccessDeniedInput,
  RecordAccessDeniedOutput,
} from '../data/index.js';
import type { FailedAttemptCounter } from '../interfaces/index.js';

export class RecordAccessDeniedUseCase implements UseCase<
  RecordAccessDeniedInput,
  RecordAccessDeniedOutput
> {
  constructor(
    private readonly factory: IpBanFactory,
    private readonly repository: IpBanRepository,
    private readonly policy: BanPolicy,
    private readonly counter: FailedAttemptCounter,
    private readonly persistence: DomainPersistence,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RecordAccessDeniedInput,
  ): Promise<Result<RecordAccessDeniedOutput>> {
    const ip = normalizeIp(input.ip);
    if (isIP(ip) === 0) {
      return Result.fail(new ValidationError(`Invalid ip address ${input.ip}`));
    }
    if (this.policy.isExempt(ip)) {
      return Result.ok({ failed_attempts: 0, ban: null });
    }

    const now = this.clock.now();
    const active = await this.repository.findActiveByIp(ip, now);
    if (active) {
      return Result.ok({ failed_attempts: 0, ban: active });
    }

    const attempts = await this.counter.increment(
      ip,
      this.policy.windowSeconds,
    );
    if (!this.policy.isExceeded(attempts)) {
      return Result.ok({ failed_attempts: attempts, ban: null });
    }

    const previous = await this.repository.countSince(
      ip,
      this.policy.strikesSince(now),
    );
    const decision = this.policy.escalate(previous, now);
    const created = this.factory.createDomain({
      ip,
      level: decision.level,
      failed_attempts: attempts,
      banned_until: decision.banned_until,
    });
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const saved = await this.persistence.persist(
      created.value,
      this.repository,
    );
    if (saved.isFailure) {
      return Result.fail(saved.error);
    }

    await this.counter.reset(ip);
    return Result.ok({ failed_attempts: attempts, ban: saved.value });
  }
}
