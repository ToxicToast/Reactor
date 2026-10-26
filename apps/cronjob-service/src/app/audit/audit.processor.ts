import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AUDIT_GRPC_CLIENT,
  AUDIT_SERVICE_NAME,
  AuditPermission,
  type AuditServiceClient,
} from '@toxictoast/contracts-grpc';
import { ActorType, type DomainContext } from '@toxictoast/shared-kernel';
import {
  actorToMetadata,
  addCorrelationMetadata,
  TOKENS,
} from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { UnrecoverableError, type Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { AUDIT_QUEUE, AuditJobs } from './constants/index.js';

@Processor(AUDIT_QUEUE)
export class AuditProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(AuditProcessor.name);
  private audit: Nullable<AuditServiceClient> = null;

  constructor(
    @Inject(AUDIT_GRPC_CLIENT) private readonly client: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) private readonly actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) private readonly ctx: DomainContext,
    private readonly correlations: CorrelationContext,
  ) {
    super();
  }

  onModuleInit(): void {
    this.audit = this.client.getService<AuditServiceClient>(AUDIT_SERVICE_NAME);
  }

  process(job: Job): Promise<unknown> {
    return this.correlations.run(this.ctx.id.generate(), () => {
      return this.dispatch(job);
    });
  }

  private async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case AuditJobs.PURGE_EXPIRED:
        return this.purgeExpired();
      default:
        throw new UnrecoverableError(`Unknown audit job ${job.name}`);
    }
  }

  private async purgeExpired(): Promise<{ removed: number }> {
    const metadata = addCorrelationMetadata(
      actorToMetadata({
        type: ActorType.SYSTEM,
        id: this.actorId,
        ip: null,
        permissions: [AuditPermission.PURGE],
      }),
      this.correlations.current(),
    );
    const response = await firstValueFrom(
      this.auditService().purgeExpiredEvents({}, metadata),
    );
    this.logger.log(`Removed ${response.removed} expired audit events`);
    return { removed: response.removed };
  }

  private auditService(): AuditServiceClient {
    if (!this.audit) {
      throw new Error('Audit client is not initialized');
    }
    return this.audit;
  }
}
