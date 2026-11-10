import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AUDIT_GRPC_CLIENT,
  AUDIT_SERVICE_NAME,
  AuditPermission,
  type AuditServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { GrpcServiceClient, TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { AUDIT_QUEUE, AuditJobs } from './constants/index.js';

@Processor(AUDIT_QUEUE)
export class AuditProcessor extends SystemJobProcessor {
  private readonly logger = new Logger(AuditProcessor.name);
  private readonly audit: GrpcServiceClient<AuditServiceClient>;

  constructor(
    @Inject(AUDIT_GRPC_CLIENT) grpc: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
    this.audit = new GrpcServiceClient<AuditServiceClient>(
      grpc,
      AUDIT_SERVICE_NAME,
    );
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
      this.audit.service.purgeExpiredEvents(
        {},
        this.metadataFor([AuditPermission.PURGE]),
      ),
    );
    this.logger.log(`Removed ${response.removed} expired audit events`);
    return { removed: response.removed };
  }
}
