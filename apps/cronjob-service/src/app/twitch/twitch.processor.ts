import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_GRPC_CLIENT,
  TWITCH_SERVICE_NAME,
  TwitchPermission,
  type TwitchServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { GrpcServiceClient, TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { TWITCH_QUEUE, TwitchJobs } from './constants/index.js';

@Processor(TWITCH_QUEUE)
export class TwitchProcessor extends SystemJobProcessor {
  private readonly logger = new Logger(TwitchProcessor.name);
  private readonly twitch: GrpcServiceClient<TwitchServiceClient>;

  constructor(
    @Inject(TWITCH_GRPC_CLIENT) grpc: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
    this.twitch = new GrpcServiceClient<TwitchServiceClient>(
      grpc,
      TWITCH_SERVICE_NAME,
    );
  }

  protected async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case TwitchJobs.CHAT_PURGE_EXPIRED:
        return this.purgeExpiredChatMessages();
      default:
        return this.unknownJob(job);
    }
  }

  private async purgeExpiredChatMessages(): Promise<{ removed: number }> {
    const response = await firstValueFrom(
      this.twitch.service.purgeExpiredChatMessages(
        {},
        this.metadataFor([TwitchPermission.CHAT_PURGE]),
      ),
    );
    this.logger.log(`Removed ${response.removed} expired chat messages`);
    return { removed: response.removed };
  }
}
