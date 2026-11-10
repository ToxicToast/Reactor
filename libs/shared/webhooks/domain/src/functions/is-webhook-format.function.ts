import { WebhookFormats } from '../constants/index.js';
import type { WebhookFormatValue } from '../types/index.js';

const FORMATS: ReadonlySet<string> = new Set(Object.values(WebhookFormats));

export const isWebhookFormat = (value: string): value is WebhookFormatValue => {
  return FORMATS.has(value);
};
