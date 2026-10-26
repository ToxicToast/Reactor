import { Processor } from '@nestjs/bullmq';
import { Inject, Logger, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_BOT_GRPC_CLIENT,
  TWITCH_BOT_SERVICE_NAME,
  TwitchBotPermission,
  type SyncChattersResponse,
  type SyncClipsResponse,
  type TwitchBotServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { TWITCH_BOT_QUEUE, TwitchBotJobs } from './constants/index.js';

@Processor(TWITCH_BOT_QUEUE)
export class TwitchBotProcessor
  extends SystemJobProcessor
  implements OnModuleInit
{
  private readonly logger = new Logger(TwitchBotProcessor.name);
  private twitch: Nullable<TwitchBotServiceClient> = null;

  constructor(
    @Inject(TWITCH_BOT_GRPC_CLIENT) private readonly client: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
  }

  onModuleInit(): void {
    this.twitch = this.client.getService<TwitchBotServiceClient>(
      TWITCH_BOT_SERVICE_NAME,
    );
  }

  protected async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case TwitchBotJobs.CHATTERS_SYNC:
        return this.syncChatters();
      case TwitchBotJobs.CLIPS_SYNC:
        return this.syncClips();
      default:
        return this.unknownJob(job);
    }
  }

  private async syncChatters(): Promise<SyncChattersResponse> {
    const response = await firstValueFrom(
      this.service().syncChatters(
        {},
        this.metadataFor([TwitchBotPermission.SYNC]),
      ),
    );
    if (response.joined > 0 || response.left > 0) {
      this.logger.log(
        `Chatters synced: ${response.joined} joined, ${response.left} left`,
      );
    }
    return response;
  }

  private async syncClips(): Promise<SyncClipsResponse> {
    const response = await firstValueFrom(
      this.service().syncClips(
        {},
        this.metadataFor([TwitchBotPermission.SYNC]),
      ),
    );
    if (response.created > 0) {
      this.logger.log(`Clips synced: ${response.created} new`);
    }
    return response;
  }

  private service(): TwitchBotServiceClient {
    if (!this.twitch) {
      throw new Error('Twitch bot client is not initialized');
    }
    return this.twitch;
  }
}
