import { ActorType, type ActorIdentity } from '@toxictoast/shared-kernel';
import { uuidEnv } from '@toxictoast/shared-system';

export const moderationActorFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): ActorIdentity => {
  return {
    type: ActorType.AI,
    id: uuidEnv('MODERATION_ACTOR_ID', source),
    ip: null,
  };
};
