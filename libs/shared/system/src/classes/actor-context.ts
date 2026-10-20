import { AsyncLocalStorage } from 'node:async_hooks';
import { SYSTEM_ACTOR } from '../constants/index.js';
import type { Actor } from '../interfaces/index.js';

export class ActorContext {
  private readonly storage = new AsyncLocalStorage<Actor>();

  current(): Actor {
    return this.storage.getStore() ?? SYSTEM_ACTOR;
  }

  run<T>(actor: Actor, work: () => T): T {
    return this.storage.run(actor, work);
  }
}
