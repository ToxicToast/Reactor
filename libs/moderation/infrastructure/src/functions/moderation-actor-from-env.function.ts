import { ActorType, type ActorIdentity } from '@toxictoast/shared-kernel';
import { uuidEnv } from '@toxictoast/shared-system';
import { MODERATION_ENV } from '../constants/index.js';

export const moderationActorFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): ActorIdentity => {
  return {
    type: ActorType.AI,
    id: uuidEnv(MODERATION_ENV.ACTOR_ID, source),
    ip: null,
  };
};
