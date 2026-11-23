import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_BOT_GRPC_CLIENT,
  TWITCH_BOT_SERVICE_NAME,
  TwitchBotPermission,
  type SyncChattersResponse,
  type SyncMediaResponse,
  type SyncFollowersResponse,
  type SyncStreamsResponse,
  type TwitchBotServiceClient,
} from '@toxictoast/contracts-grpc';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { GrpcServiceClient, TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { Job } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { SystemJobProcessor } from '../common/processors/index.js';
import { CRONJOB_TOKENS } from '../constants/index.js';
import { TWITCH_BOT_QUEUE, TwitchBotJobs } from './constants/index.js';

@Processor(TWITCH_BOT_QUEUE)
export class TwitchBotProcessor extends SystemJobProcessor {
  private readonly logger = new Logger(TwitchBotProcessor.name);
  private readonly twitch: GrpcServiceClient<TwitchBotServiceClient>;

  constructor(
    @Inject(TWITCH_BOT_GRPC_CLIENT) grpc: ClientGrpc,
    @Inject(CRONJOB_TOKENS.ACTOR_ID) actorId: string,
    @Inject(TOKENS.DOMAIN_CONTEXT) ctx: DomainContext,
    correlations: CorrelationContext,
  ) {
    super(actorId, ctx, correlations);
    this.twitch = new GrpcServiceClient<TwitchBotServiceClient>(
      grpc,
      TWITCH_BOT_SERVICE_NAME,
    );
  }

  protected async dispatch(job: Job): Promise<unknown> {
    switch (job.name) {
      case TwitchBotJobs.CHATTERS_SYNC:
        return this.syncChatters();
      case TwitchBotJobs.CLIPS_SYNC:
        return this.syncMedia();
      case TwitchBotJobs.FOLLOWERS_SYNC:
        return this.syncFollowers();
      case TwitchBotJobs.STREAMS_SYNC:
        return this.syncStreams();
      default:
        return this.unknownJob(job);
    }
  }

  private async syncChatters(): Promise<SyncChattersResponse> {
    const response = await firstValueFrom(
      this.twitch.service.syncChatters(
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

  private async syncMedia(): Promise<SyncMediaResponse> {
    const response = await firstValueFrom(
      this.twitch.service.syncMedia(
        {},
        this.metadataFor([TwitchBotPermission.SYNC]),
      ),
    );
    if (response.imported_clips > 0 || response.imported_videos > 0) {
      this.logger.log(
        `Media imported: ${response.imported_clips} clips, ${response.imported_videos} videos`,
      );
    }
    if (response.created_clips > 0 || response.created_videos > 0) {
      this.logger.log(
        `Media synced: ${response.created_clips} new clips, ${response.created_videos} new videos`,
      );
    }
    return response;
  }

  private async syncFollowers(): Promise<SyncFollowersResponse> {
    const response = await firstValueFrom(
      this.twitch.service.syncFollowers(
        {},
        this.metadataFor([TwitchBotPermission.SYNC]),
      ),
    );
    if (response.followed > 0 || response.unfollowed > 0) {
      this.logger.log(
        `Followers synced: ${response.followed} found, ${response.unfollowed} unfollowed`,
      );
    }
    return response;
  }

  private async syncStreams(): Promise<SyncStreamsResponse> {
    const response = await firstValueFrom(
      this.twitch.service.syncStreams(
        {},
        this.metadataFor([TwitchBotPermission.SYNC]),
      ),
    );
    if (response.online > 0 || response.offline > 0) {
      this.logger.log(
        `Streams synced: ${response.online} went online, ${response.offline} went offline`,
      );
    }
    return response;
  }
}
