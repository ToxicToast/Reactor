import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { numberEnv } from '@toxictoast/shared-system';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app/app.module.js';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.set('trust proxy', numberEnv('TRUST_PROXY_HOPS', 0));

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
