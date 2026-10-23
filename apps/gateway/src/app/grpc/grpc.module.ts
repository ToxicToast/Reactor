import { Module } from '@nestjs/common';
import { provideClass } from '@toxictoast/shared-nest';
import { ActorContext } from '@toxictoast/shared-system';
import { ActorMetadata } from './services/index.js';

@Module({
  providers: [provideClass(ActorMetadata, [ActorContext])],
  exports: [ActorMetadata],
})
export class GrpcModule {}
