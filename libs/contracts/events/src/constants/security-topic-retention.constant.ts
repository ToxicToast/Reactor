import { SecurityTopics } from './security-topics.constant.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export const SECURITY_TOPIC_RETENTION_MS: Readonly<Record<string, number>> = {
  [SecurityTopics.IP]: 30 * DAY_MS,
};
