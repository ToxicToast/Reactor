import type { ActorIdentity } from '../interfaces/index.js';
import { isActorType } from './is-actor-type.function.js';
import { isNullableString } from './is-nullable-string.function.js';

export const isActorIdentity = (value: unknown): value is ActorIdentity => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    isActorType(candidate['type']) &&
    isNullableString(candidate['id']) &&
    isNullableString(candidate['ip'])
  );
};
