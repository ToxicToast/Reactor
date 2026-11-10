import type {
  FormattedWebhook,
  WebhookFormatter,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookFormats,
  type WebhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-domain';
import { WEBHOOK_HTTP } from '../constants/index.js';
import { genericDiscordEmbed, limitDiscordEmbed } from '../functions/index.js';
import type {
  DiscordEmbed,
  DiscordWebhookMessage,
} from '../interfaces/index.js';
import type { DiscordEmbedRenderers } from '../types/index.js';

export class DiscordWebhookFormatter implements WebhookFormatter {
  readonly name = WebhookFormats.DISCORD;

  constructor(private readonly renderers: DiscordEmbedRenderers = {}) {}

  render(delivery: WebhookDeliveryAnemic): FormattedWebhook {
    const message: DiscordWebhookMessage = {
      embeds: [
        limitDiscordEmbed({
          timestamp: delivery.occurred_at.toISOString(),
          ...this.embedOf(delivery),
        }),
      ],
    };
    return {
      content_type: WEBHOOK_HTTP.CONTENT_TYPE_JSON,
      body: JSON.stringify(message),
    };
  }

  /** Ein kaputter Payload darf den Relay nie blockieren, deshalb fällt jeder Fehler aufs allgemeine Embed zurück. */
  private embedOf(delivery: WebhookDeliveryAnemic): DiscordEmbed {
    const renderer = this.renderers[delivery.event_key];
    if (!renderer) {
      return genericDiscordEmbed(delivery);
    }
    try {
      return renderer(delivery);
    } catch {
      return genericDiscordEmbed(delivery);
    }
  }
}
