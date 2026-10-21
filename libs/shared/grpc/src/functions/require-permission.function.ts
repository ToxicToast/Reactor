import { isUuid, type Actor, type Id } from '@toxictoast/shared-kernel';
import { permissionDenied } from './permission-denied.function.js';
import { unauthenticated } from './unauthenticated.function.js';

export const requirePermission = <T extends string>(
  actor: Actor,
  permission: string,
): Id<T> => {
  if (!isUuid(actor.id)) {
    throw unauthenticated('a signed-in actor is required');
  }
  if (!actor.permissions.includes(permission)) {
    throw permissionDenied(`missing permission ${permission}`);
  }
  return actor.id.toLowerCase() as Id<T>;
};
