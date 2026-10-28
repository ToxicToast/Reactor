import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { webhookSchemas } from '../schemas/index.js';

export class WebhookTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: webhookSchemas });
  }
}
