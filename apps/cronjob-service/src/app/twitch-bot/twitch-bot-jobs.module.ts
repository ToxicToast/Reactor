import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TWITCH_BOT_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import {
  TWITCH_BOT_PACKAGE,
  TWITCH_BOT_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { GrpcClientModule } from '@toxictoast/shared-nest';
import { TWITCH_BOT_QUEUE } from './constants/index.js';
import { TwitchBotProcessor } from './twitch-bot.processor.js';
import { TwitchBotSchedules } from './twitch-bot.schedules.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: TWITCH_BOT_QUEUE }),
    BullBoardModule.forFeature({
      name: TWITCH_BOT_QUEUE,
      adapter: BullMQAdapter,
    }),
    GrpcClientModule.register({
      name: TWITCH_BOT_GRPC_CLIENT,
      package: TWITCH_BOT_PACKAGE,
      protoPath: TWITCH_BOT_PROTO_FILES,
      urlEnv: 'TWITCH_BOT_GRPC_URL',
    }),
  ],
  providers: [TwitchBotProcessor, TwitchBotSchedules],
})
export class TwitchBotJobsModule {}
