import { Module } from '@nestjs/common';
import {
  GRPC_CLIENT_ENV,
  SHORTENER_GRPC_CLIENT,
} from '@toxictoast/contracts-grpc';
import {
  SHORTENER_PACKAGE,
  SHORTENER_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import {
  GrpcClientModule,
  provideClass,
  TOKENS,
} from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import { GrpcModule } from '../grpc/grpc.module.js';
import { RequestMetadata } from '../grpc/services/index.js';
import {
  LinkRedirectController,
  LinksController,
} from './controllers/index.js';
import { LinkGateway } from './link.gateway.js';
import { LinkClickReporter } from './services/index.js';

@Module({
  imports: [
    GrpcModule,
    GrpcClientModule.register({
      name: SHORTENER_GRPC_CLIENT,
      package: SHORTENER_PACKAGE,
      protoPath: SHORTENER_PROTO_FILES,
      urlEnv: GRPC_CLIENT_ENV.SHORTENER,
    }),
  ],
  controllers: [LinkRedirectController, LinksController],
  providers: [
    provideClass(LinkGateway, [SHORTENER_GRPC_CLIENT, RequestMetadata]),
    provideClass(LinkClickReporter, [
      TOKENS.EVENT_PUBLISHER,
      TOKENS.DOMAIN_CONTEXT,
      CorrelationContext,
    ]),
  ],
})
export class ShortenerModule {}
