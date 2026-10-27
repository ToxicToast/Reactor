import { Module } from '@nestjs/common';
import { provideClass } from '@toxictoast/shared-nest';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import { RequestMetadata } from './services/index.js';

@Module({
  providers: [
    provideClass(RequestMetadata, [ActorContext, CorrelationContext]),
  ],
  exports: [RequestMetadata],
})
export class GrpcModule {}
