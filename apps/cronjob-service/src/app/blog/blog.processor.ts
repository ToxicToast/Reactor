import { Inject, Logger, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import {
  BlogPermission,
  MEDIA_SERVICE_NAME,
  type MediaServiceClient,
} from '@toxictoast/contracts-grpc';
import { ActorType } from '@toxictoast/shared-kernel';
import { actorToMetadata } from '@toxictoast/shared-nest';
import type { Nullable } from '@toxictoast/shared-types';
import { UnrecoverableError, type Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { BLOG_GRPC_CLIENT, BLOG_QUEUE, BlogJobs } from './constants/index.js';

@Processor(BLOG_QUEUE)
export class BlogProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(BlogProcessor.name);
  private media: Nullable<MediaServiceClient> = null;

  constructor(
    @Inject(BLOG_GRPC_CLIENT) private readonly client: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) private readonly actorId: string,
  ) {
    super();
  }

  onModuleInit(): void {
    this.media = this.client.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case BlogJobs.MEDIA_CLEANUP:
        return this.cleanupPendingMedia();
      default:
        throw new UnrecoverableError(`Unknown blog job ${job.name}`);
    }
  }

  private async cleanupPendingMedia(): Promise<{ removed: number }> {
    const response = await firstValueFrom(
      this.mediaService().cleanupPendingMedia(
        {},
        actorToMetadata({
          type: ActorType.SYSTEM,
          id: this.actorId,
          ip: null,
          permissions: [BlogPermission.MEDIA_DELETE],
        }),
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
