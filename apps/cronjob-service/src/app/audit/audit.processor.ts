import { Processor } from '@nestjs/bullmq';
import { Inject, Logger, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AUDIT_GRPC_CLIENT,
  AUDIT_SERVICE_NAME,
  AuditPermission,
  type AuditServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { AUDIT_QUEUE, AuditJobs } from './constants/index.js';

@Processor(AUDIT_QUEUE)
export class AuditProcessor extends SystemJobProcessor implements OnModuleInit {
  private readonly logger = new Logger(AuditProcessor.name);
  private audit: Nullable<AuditServiceClient> = null;

  constructor(
    @Inject(AUDIT_GRPC_CLIENT) private readonly client: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
  }

  onModuleInit(): void {
    this.audit = this.client.getService<AuditServiceClient>(AUDIT_SERVICE_NAME);
  }

  protected async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case AuditJobs.PURGE_EXPIRED:
        return this.purgeExpired();
      default:
        return this.unknownJob(job);
    }
  }

  private async purgeExpired(): Promise<{ removed: number }> {
    const response = await firstValueFrom(
      this.auditService().purgeExpiredEvents(
        {},
        this.metadataFor([AuditPermission.PURGE]),
      ),
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
