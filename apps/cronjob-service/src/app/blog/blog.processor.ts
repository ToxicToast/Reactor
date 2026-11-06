import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  BLOG_GRPC_CLIENT,
  BlogPermission,
  MEDIA_SERVICE_NAME,
  type MediaServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { GrpcServiceClient, TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { BLOG_QUEUE, BlogJobs } from './constants/index.js';

@Processor(BLOG_QUEUE)
export class BlogProcessor extends SystemJobProcessor {
  private readonly logger = new Logger(BlogProcessor.name);
  private readonly media: GrpcServiceClient<MediaServiceClient>;

  constructor(
    @Inject(BLOG_GRPC_CLIENT) grpc: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
    this.media = new GrpcServiceClient<MediaServiceClient>(
      grpc,
      MEDIA_SERVICE_NAME,
    );
  }

  protected async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case BlogJobs.MEDIA_CLEANUP:
        return this.cleanupPendingMedia();
      default:
        return this.unknownJob(job);
    }
  }

  private async cleanupPendingMedia(): Promise<{ removed: number }> {
    const response = await firstValueFrom(
      this.media.service.cleanupPendingMedia(
        {},
        this.metadataFor([BlogPermission.MEDIA_DELETE]),
      ),
    );
    this.logger.log(`Removed ${response.removed} pending media`);
    return { removed: response.removed };
  }
}
