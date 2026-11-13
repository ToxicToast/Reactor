import type { WebhookEvents, WebhookTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { WebhookPayloadV1 } from '../payloads/index.js';

export type WebhookEventV1 = EventEnvelope<
  typeof WebhookTopics.WEBHOOK,
  (typeof WebhookEvents)[keyof typeof WebhookEvents],
  WebhookPayloadV1
>;
