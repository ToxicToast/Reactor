import { Processor } from '@nestjs/bullmq';
import { Inject, Logger, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  BLOG_GRPC_CLIENT,
  BlogPermission,
  MEDIA_SERVICE_NAME,
  type MediaServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { BLOG_QUEUE, BlogJobs } from './constants/index.js';

@Processor(BLOG_QUEUE)
export class BlogProcessor extends SystemJobProcessor implements OnModuleInit {
  private readonly logger = new Logger(BlogProcessor.name);
  private media: Nullable<MediaServiceClient> = null;

  constructor(
    @Inject(BLOG_GRPC_CLIENT) private readonly client: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
  }

  onModuleInit(): void {
    this.media = this.client.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
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
      this.mediaService().cleanupPendingMedia(
        {},
        this.metadataFor([BlogPermission.MEDIA_DELETE]),
      ),
    );
    this.logger.log(`Removed ${response.removed} pending media`);
    return { removed: response.removed };
  }

  private mediaService(): MediaServiceClient {
    if (!this.media) {
      throw new Error('Blog media client is not initialized');
    }
    return this.media;
  }
}
