import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  HealthModule,
  MetricsModule,
  provideClass,
  SystemModule,
} from '@toxictoast/shared-nest';
import { ZodValidationPipe } from 'nestjs-zod';
import { keycloakConfigFromEnv } from './auth/functions/index.js';
import { HttpActorInterceptor } from './auth/interceptors/index.js';
import { KeycloakTokenVerifier } from './auth/services/index.js';
import { GATEWAY_TOKENS } from './constants/index.js';
import { GrpcExceptionFilter } from './grpc/filters/index.js';
import { BlogModule } from './blog/blog.module.js';

const { KEYCLOAK_CONFIG } = GATEWAY_TOKENS;

@Module({
  imports: [
    SystemModule,
    HealthModule.forRoot({ database: false }),
    MetricsModule.forRoot({ outbox: false }),
    BlogModule,
  ],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: KEYCLOAK_CONFIG,
      useFactory: () => keycloakConfigFromEnv(),
    },

    // ── Auth ────────────────────────────────────
    provideClass(KeycloakTokenVerifier, [KEYCLOAK_CONFIG]),
    { provide: APP_INTERCEPTOR, useClass: HttpActorInterceptor },

    // ── HTTP ────────────────────────────────────
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: GrpcExceptionFilter },
  ],
})
export class AppModule {}
