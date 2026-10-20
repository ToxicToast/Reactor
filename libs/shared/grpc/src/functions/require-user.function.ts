import {
  ActorType,
  isUuid,
  type Actor,
  type Id,
} from '@toxictoast/shared-kernel';
import { unauthenticated } from './unauthenticated.function.js';

export const requireUser = <T extends string>(actor: Actor): Id<T> => {
  if (actor.type !== ActorType.USER || !isUuid(actor.id)) {
    throw unauthenticated('a signed-in user is required');
  }
  return actor.id.toLowerCase() as Id<T>;
};
