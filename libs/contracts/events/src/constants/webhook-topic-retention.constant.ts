import { TopicRetention } from './topic-retention.constant.js';
import { WebhookTopics } from './webhook-topics.constant.js';

export const WEBHOOK_TOPIC_RETENTION_MS: Readonly<Record<string, number>> =
  Object.fromEntries(
    Object.values(WebhookTopics).map((topic) => [
      topic,
      TopicRetention.UNLIMITED,
    ]),
  );
