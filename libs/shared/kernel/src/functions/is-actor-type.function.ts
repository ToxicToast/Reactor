import { ActorType } from '../enums/index.js';

const ACTOR_TYPES: ReadonlyArray<string> = Object.values(ActorType);

export const isActorType = (value: unknown): value is ActorType => {
  return typeof value === 'string' && ACTOR_TYPES.includes(value);
};
