import type { Metadata } from '@grpc/grpc-js';
import {
  actorToMetadata,
  addCorrelationMetadata,
} from '@toxictoast/shared-nest';
import type {
  ActorContext,
  CorrelationContext,
} from '@toxictoast/shared-system';

export class RequestMetadata {
  constructor(
    private readonly actors: ActorContext,
    private readonly correlations: CorrelationContext,
  ) {}

  current(): Metadata {
    return addCorrelationMetadata(
      actorToMetadata(this.actors.current()),
      this.correlations.current(),
    );
  }
}
