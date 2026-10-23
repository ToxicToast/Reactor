import { Module } from '@nestjs/common';
import { provideClass } from '@toxictoast/shared-nest';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import { ActorMetadata } from './services/index.js';

@Module({
  providers: [provideClass(ActorMetadata, [ActorContext, CorrelationContext])],
  exports: [ActorMetadata],
})
export class GrpcModule {}
