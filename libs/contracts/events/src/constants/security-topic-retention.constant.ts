import { TIME_MS } from '@toxictoast/shared-types';
import { SecurityTopics } from './security-topics.constant.js';

export const SECURITY_TOPIC_RETENTION_MS: Readonly<Record<string, number>> = {
  [SecurityTopics.IP]: 30 * TIME_MS.DAY,
};
