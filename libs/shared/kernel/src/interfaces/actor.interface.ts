import type { ActorIdentity } from './actor-identity.interface.js';

export interface Actor extends ActorIdentity {
  readonly permissions: ReadonlyArray<string>;
}
