import { AsyncLocalStorage } from 'node:async_hooks';
import {
  ActorProvider,
  SYSTEM_ACTOR,
  type Actor,
} from '@toxictoast/shared-kernel';

export class ActorContext extends ActorProvider {
  private readonly storage = new AsyncLocalStorage<Actor>();

  current(): Actor {
    return this.storage.getStore() ?? SYSTEM_ACTOR;
  }

  run<T>(actor: Actor, work: () => T): T {
    return this.storage.run(actor, work);
  }
}
