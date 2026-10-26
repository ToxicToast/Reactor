import { randomUUID } from 'node:crypto';
import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  SECURITY_TOPIC_RETENTION_MS,
  SecurityTopics,
} from '@toxictoast/contracts-events';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { ZodValidationPipe } from 'nestjs-zod';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HttpActorInterceptor } from './auth/interceptors/index.js';
import { BlogModule } from './blog/blog.module.js';
import { CorrelationMiddleware } from './correlation/middlewares/index.js';
import { GrpcExceptionFilter } from './grpc/filters/index.js';
import { AccessReportModule } from './security/access-report.module.js';
import { BanListModule } from './security/ban-list.module.js';
import { IpBanHandler } from './security/consumers/index.js';
import { BanMiddleware } from './security/middlewares/index.js';
import { BanAdminModule } from './security/bans/ban-admin.module.js';

@Module({
  imports: [
    SystemModule,
    HealthModule.forRoot({ database: false, replay: true }),
    MetricsModule.forRoot({ outbox: false }),
    MessagingModule.forRoot({
      groupId: `gateway-${randomUUID()}`,
      outbox: false,
      replay: true,
      imports: [BanListModule],
      handlers: {
        inject: [IpBanHandler],
        useFactory: (handler: IpBanHandler) => {
          return {
            'security.ip.banned': (event) => handler.banned(event.payload),
            'security.ip.unbanned': (event) => handler.unbanned(event.payload),
          };
        },
      },
      topics: [SecurityTopics.ACCESS],
      topicRetentionMs: SECURITY_TOPIC_RETENTION_MS,
    }),
    BanListModule,
    AccessReportModule,
    AuthModule,
    AdminModule,
    BlogModule,
    BanAdminModule,
  ],
  providers: [
    // ── Auth ────────────────────────────────────
    { provide: APP_INTERCEPTOR, useClass: HttpActorInterceptor },

    // ── HTTP ────────────────────────────────────
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: GrpcExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware, BanMiddleware).forRoutes('{*path}');
  }
}
