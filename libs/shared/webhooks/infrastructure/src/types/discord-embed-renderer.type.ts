import type { WebhookDeliveryAnemic } from '@toxictoast/shared-webhooks-domain';
import type { DiscordEmbed } from '../interfaces/index.js';

export type DiscordEmbedRenderer = (
  delivery: WebhookDeliveryAnemic,
) => DiscordEmbed;
