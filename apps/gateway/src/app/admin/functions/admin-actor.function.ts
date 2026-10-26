import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { AdminSession } from '../interfaces/index.js';

export const adminActor = (
  session: AdminSession,
  ip: Nullable<string>,
): Actor => {
  return {
    type: ActorType.USER,
    id: session.sub,
    ip,
    permissions: session.permissions,
  };
};
