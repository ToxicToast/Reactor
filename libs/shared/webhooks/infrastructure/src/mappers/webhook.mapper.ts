import type { Mapper } from '@toxictoast/shared-persistence';
import type { SecretCipher } from '@toxictoast/shared-system';
import type {
  WebhookAnemic,
  WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import type { WebhookRow } from '../interfaces/index.js';

export class WebhookMapper implements Mapper<WebhookAnemic, WebhookRow> {
  constructor(private readonly cipher: SecretCipher) {}

  toAnemic(row: WebhookRow): WebhookAnemic {
    return {
      id: row.id as WebhookId,
      url: row.url,
      events: [...row.events],
      description: row.description,
      active: row.active,
      format: row.format,
      secret: this.cipher.decrypt(row.secret),
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: WebhookAnemic): WebhookRow {
    return {
      id: anemic.id,
      url: anemic.url,
      events: [...anemic.events],
      description: anemic.description,
      active: anemic.active,
      format: anemic.format,
      secret: this.cipher.encrypt(anemic.secret),
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
