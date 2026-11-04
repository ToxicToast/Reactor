import type { DiscordEmbedField } from '@toxictoast/shared-webhooks-infrastructure';

export const countField = (name: string, value: number): DiscordEmbedField => {
  return { name, value: value.toLocaleString('de-DE'), inline: true };
};
