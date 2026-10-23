import { isUuid } from '@toxictoast/shared-kernel';
import { requiredEnv } from '@toxictoast/shared-system';

export const cronjobActorIdFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): string => {
  const id = requiredEnv('CRONJOB_ACTOR_ID', source);
  if (!isUuid(id)) {
    throw new Error('Environment variable CRONJOB_ACTOR_ID must be a uuid');
  }
  return id.toLowerCase();
};
