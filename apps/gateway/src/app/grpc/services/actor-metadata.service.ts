import type { Metadata } from '@grpc/grpc-js';
import { actorToMetadata } from '@toxictoast/shared-nest';
import type { ActorContext } from '@toxictoast/shared-system';

export class ActorMetadata {
  constructor(private readonly actors: ActorContext) {}

  current(): Metadata {
    return actorToMetadata(this.actors.current());
  }
}
