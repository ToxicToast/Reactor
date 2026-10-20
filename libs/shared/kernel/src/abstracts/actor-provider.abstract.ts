import type { Actor } from '../interfaces/index.js';

export abstract class ActorProvider {
  abstract current(): Actor;
}
