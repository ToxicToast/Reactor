import type { DiscordEmbed } from './discord-embed.interface.js';

export interface DiscordWebhookMessage {
  readonly embeds: ReadonlyArray<DiscordEmbed>;
}
