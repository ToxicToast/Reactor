import { ActorType, type ActorIdentity } from '@toxictoast/shared-kernel';

export const MODERATION_ACTOR: ActorIdentity = Object.freeze({
  type: ActorType.AI,
  id: 'moderation-service',
  ip: null,
});
