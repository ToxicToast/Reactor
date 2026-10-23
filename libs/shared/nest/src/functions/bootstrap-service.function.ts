import type { Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { GrpcOptions } from '@nestjs/microservices';
import { CorrelationContext, numberEnv } from '@toxictoast/shared-system';
import type { Optional } from '@toxictoast/shared-types';
import type { GrpcServerConfig } from '../interfaces/index.js';
import { CorrelationLogger } from '../loggers/index.js';
import { createGrpcOptions } from './create-grpc-options.function.js';

export const bootstrapService = async (
  module: Type<unknown>,
  grpc?: Optional<GrpcServerConfig>,
): Promise<void> => {
  const app = await NestFactory.create(module, { bufferLogs: true });
  app.useLogger(new CorrelationLogger(app.get(CorrelationContext)));
  app.enableShutdownHooks();
  if (grpc) {
    app.connectMicroservice<GrpcOptions>(createGrpcOptions(grpc), {
      inheritAppConfig: true,
    });
    await app.startAllMicroservices();
  }
  await app.listen(numberEnv('HTTP_PORT', 3000));
};
