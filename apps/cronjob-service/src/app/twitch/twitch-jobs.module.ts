import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TWITCH_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import {
  TWITCH_PACKAGE,
  TWITCH_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { GrpcClientModule } from '@toxictoast/shared-nest';
import { TWITCH_QUEUE } from './constants/index.js';
import { TwitchProcessor } from './twitch.processor.js';
import { TwitchSchedules } from './twitch.schedules.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: TWITCH_QUEUE }),
    BullBoardModule.forFeature({
      name: TWITCH_QUEUE,
      adapter: BullMQAdapter,
    }),
    GrpcClientModule.register({
      name: TWITCH_GRPC_CLIENT,
      package: TWITCH_PACKAGE,
      protoPath: TWITCH_PROTO_FILES,
      urlEnv: 'TWITCH_GRPC_URL',
    }),
  ],
  providers: [TwitchProcessor, TwitchSchedules],
})
export class TwitchJobsModule {}
