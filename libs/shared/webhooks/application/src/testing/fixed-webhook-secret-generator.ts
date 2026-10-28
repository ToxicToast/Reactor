import type { WebhookSecretGenerator } from '../interfaces/index.js';

export class FixedWebhookSecretGenerator implements WebhookSecretGenerator {
  private counter = 0;

  generate(): string {
    this.counter++;
    return `whsec_${this.counter}`;
  }
}
