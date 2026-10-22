import { ActorProvider, type Actor } from '@toxictoast/shared-kernel';
import { testActor } from './test-actor.js';

export class TestActorProvider extends ActorProvider {
  constructor(public actor: Actor = testActor()) {
    super();
  }

  current(): Actor {
    return this.actor;
  }
}
