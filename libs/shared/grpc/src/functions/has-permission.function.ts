import type { Actor } from '@toxictoast/shared-kernel';

export const hasPermission = (actor: Actor, permission: string): boolean => {
  return actor.permissions.includes(permission);
};
