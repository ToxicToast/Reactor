import { Logger, Module } from '@nestjs/common';
import {
  GRPC_CLIENT_ENV,
  SHORTENER_GRPC_CLIENT,
} from '@toxictoast/contracts-grpc';
import {
  SHORTENER_PACKAGE,
  SHORTENER_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import {
  countryLookupFromEnv,
  type CountryLookup,
} from '@toxictoast/shared-geoip';
import {
  GrpcClientModule,
  provideClass,
  TOKENS,
} from '@toxictoast/shared-nest';
import { CorrelationContext, describeError } from '@toxictoast/shared-system';
import { GATEWAY_TOKENS } from '../constants/index.js';
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
    {
      provide: GATEWAY_TOKENS.COUNTRY_LOOKUP,
      useFactory: (): Promise<CountryLookup> => {
        const logger = new Logger('GeoIp');
        return countryLookupFromEnv((error) => {
          logger.warn(
            'GeoIP database unavailable, clicks are stored without country',
            describeError(error),
          );
        });
      },
    },
    provideClass(LinkGateway, [SHORTENER_GRPC_CLIENT, RequestMetadata]),
    provideClass(LinkClickReporter, [
      TOKENS.EVENT_PUBLISHER,
      TOKENS.DOMAIN_CONTEXT,
      CorrelationContext,
      GATEWAY_TOKENS.COUNTRY_LOOKUP,
    ]),
  ],
})
export class ShortenerModule {}
