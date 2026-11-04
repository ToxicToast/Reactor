import { truncateText } from '@toxictoast/shared-kernel';
import type { WebhookDeliveryAnemic } from '@toxictoast/shared-webhooks-domain';
import { DISCORD } from '../constants/index.js';
import type { DiscordEmbed } from '../interfaces/index.js';

/** Für Events ohne eigenen Renderer: Event-Key als Titel, Payload als JSON-Codeblock */
export const genericDiscordEmbed = (
  delivery: WebhookDeliveryAnemic,
): DiscordEmbed => {
  const payload = truncateText(
    JSON.stringify(delivery.payload, null, 2),
    DISCORD.LIMITS.GENERIC_PAYLOAD,
  );
  return {
    title: delivery.event_key,
    description: `${DISCORD.FENCE}json\n${payload}\n${DISCORD.FENCE}`,
  };
};
