import { Module } from '@nestjs/common';
import { TWITCH_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import {
  TWITCH_PACKAGE,
  TWITCH_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { AdminModule } from '../../admin/admin.module.js';
import { GrpcModule } from '../../grpc/grpc.module.js';
import { RequestMetadata } from '../../grpc/services/index.js';
import {
  TwitchChatController,
  TwitchEventsController,
  TwitchStatsController,
  TwitchWebhooksController,
} from './controllers/index.js';
import { TwitchServiceGateway } from './twitch-service.gateway.js';

@Module({
  imports: [
    AdminModule,
    GrpcModule,
    GrpcClientModule.register({
      name: TWITCH_GRPC_CLIENT,
      package: TWITCH_PACKAGE,
      protoPath: TWITCH_PROTO_FILES,
      urlEnv: 'TWITCH_GRPC_URL',
    }),
  ],
  controllers: [
    TwitchStatsController,
    TwitchChatController,
    TwitchWebhooksController,
    TwitchEventsController,
  ],
  providers: [
    provideClass(TwitchServiceGateway, [TWITCH_GRPC_CLIENT, RequestMetadata]),
  ],
})
export class TwitchServiceModule {}
