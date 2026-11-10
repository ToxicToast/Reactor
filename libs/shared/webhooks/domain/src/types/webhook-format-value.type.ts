import type { WebhookFormats } from '../constants/index.js';

export type WebhookFormatValue =
  (typeof WebhookFormats)[keyof typeof WebhookFormats];
