import { TIME_MS } from '@toxictoast/shared-types';
import { SocialTopics } from './social-topics.constant.js';

/** dauerhaft liegen die Stände im publisher-service und 365 Tage im Audit */
export const SOCIAL_TOPIC_RETENTION_MS: Readonly<Record<string, number>> = {
  [SocialTopics.ACCOUNT]: 7 * TIME_MS.DAY,
  [SocialTopics.POST]: 7 * TIME_MS.DAY,
};
