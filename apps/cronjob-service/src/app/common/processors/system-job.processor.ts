import type { Metadata } from '@grpc/grpc-js';
import { WorkerHost } from '@nestjs/bullmq';
import { ActorType, type DomainContext } from '@toxictoast/shared-kernel';
import {
  actorToMetadata,
  addCorrelationMetadata,
} from '@toxictoast/shared-nest';
import type { CorrelationContext } from '@toxictoast/shared-system';
import { UnrecoverableError, type Job } from 'bullmq';

export abstract class SystemJobProcessor extends WorkerHost {
  protected constructor(
    private readonly actorId: string,
    private readonly ctx: DomainContext,
    private readonly correlations: CorrelationContext,
  ) {
    super();
  }

  process(job: Job): Promise<unknown> {
    return this.correlations.run(this.ctx.id.generate(), () => {
      return this.dispatch(job);
    });
  }

  protected abstract dispatch(job: Job): Promise<unknown>;

  protected metadataFor(permissions: ReadonlyArray<string>): Metadata {
    return addCorrelationMetadata(
      actorToMetadata({
        type: ActorType.SYSTEM,
        id: this.actorId,
        ip: null,
        permissions,
      }),
      this.correlations.current(),
    );
  }

  protected unknownJob(job: Job): never {
    throw new UnrecoverableError(
      `Unknown job ${job.name} in queue ${job.queueName}`,
    );
  }
}
