import { randomBytes } from 'node:crypto';
import type { WebhookSecretGenerator } from '@toxictoast/shared-webhooks-application';
import { WEBHOOK_SECRET } from '../constants/index.js';

export class RandomWebhookSecretGenerator implements WebhookSecretGenerator {
  generate(): string {
    return `${WEBHOOK_SECRET.PREFIX}${randomBytes(WEBHOOK_SECRET.BYTES).toString('base64url')}`;
  }
}
