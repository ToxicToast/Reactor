import { Module } from '@nestjs/common';
import { TWITCH_BOT_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import {
  TWITCH_BOT_PACKAGE,
  TWITCH_BOT_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { AdminModule } from '../admin/admin.module.js';
import { GATEWAY_TOKENS } from '../constants/index.js';
import { GrpcModule } from '../grpc/grpc.module.js';
import { ActorMetadata } from '../grpc/services/index.js';
import {
  TwitchChannelsController,
  TwitchConnectController,
} from './controllers/index.js';
import { twitchAdminConfigFromEnv } from './functions/index.js';
import { TwitchGateway } from './twitch.gateway.js';

@Module({
  imports: [
    AdminModule,
    GrpcModule,
    GrpcClientModule.register({
      name: TWITCH_BOT_GRPC_CLIENT,
      package: TWITCH_BOT_PACKAGE,
      protoPath: TWITCH_BOT_PROTO_FILES,
      urlEnv: 'TWITCH_BOT_GRPC_URL',
    }),
  ],
  controllers: [TwitchConnectController, TwitchChannelsController],
  providers: [
    {
      provide: GATEWAY_TOKENS.TWITCH_ADMIN_CONFIG,
      useFactory: () => twitchAdminConfigFromEnv(),
    },
    provideClass(TwitchGateway, [TWITCH_BOT_GRPC_CLIENT, ActorMetadata]),
  ],
})
export class TwitchAdminModule {}
