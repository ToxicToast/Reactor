import { ActorType, type Actor } from '@toxictoast/shared-kernel';

export const anonymousTestActor = (): Actor => {
  return { type: ActorType.ANONYMOUS, id: null, ip: null, permissions: [] };
};
