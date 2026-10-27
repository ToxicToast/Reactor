import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app/app.module.js';
import { CorrelationLogger } from '@toxictoast/shared-nest';
import {
  CorrelationContext,
  numberEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ADMIN_PATHS } from './app/admin/constants/index.js';
import { AdminSessionMiddleware } from './app/admin/middlewares/index.js';
import { proxyErrorHandler } from './app/admin/functions/index.js';
import { CORS_HEADERS, CORS_METHODS } from './app/cors/constants/index.js';
import { corsConfigFromEnv } from './app/cors/functions/index.js';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(new CorrelationLogger(app.get(CorrelationContext)));
  app.enableShutdownHooks();
  app.set('trust proxy', numberEnv('TRUST_PROXY_HOPS', 0));
  app.disable('x-powered-by');

  const cors = corsConfigFromEnv();
  if (cors.origins.length > 0) {
    app.enableCors({
      origin: [...cors.origins],
      credentials: cors.allowCredentials,
      methods: [...CORS_METHODS],
      allowedHeaders: [...CORS_HEADERS.ALLOWED],
      exposedHeaders: [...CORS_HEADERS.EXPOSED],
      maxAge: cors.maxAgeSeconds,
    });
  }

  const adminSession = app.get(AdminSessionMiddleware);
  app.use(
    ADMIN_PATHS.QUEUES,
    (request: Request, response: Response, next: NextFunction) => {
      adminSession.use(request, response, next).catch(next);
    },
  );
  app.use(
    createProxyMiddleware({
      target: requiredEnv('CRONJOB_URL'),
      changeOrigin: true,
      pathFilter: ADMIN_PATHS.QUEUES,
      on: {
        error: proxyErrorHandler,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Azkaban API')
    .setVersion('1')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    cleanupOpenApiDoc(SwaggerModule.createDocument(app, config)),
  );

  await app.listen(numberEnv('HTTP_PORT', 3000));
};

void bootstrap();
