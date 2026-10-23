import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  HealthModule,
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

@Module({
  imports: [
    SystemModule,
    HealthModule.forRoot({ database: false }),
    MetricsModule.forRoot({ outbox: false }),
    AuthModule,
    AdminModule,
    BlogModule,
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
    consumer.apply(CorrelationMiddleware).forRoutes('{*path}');
  }
}
