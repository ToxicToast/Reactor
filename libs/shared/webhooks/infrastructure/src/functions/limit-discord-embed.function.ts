import { truncateText } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import { DISCORD } from '../constants/index.js';
import type { DiscordEmbed } from '../interfaces/index.js';

const { LIMITS, EMPTY_VALUE } = DISCORD;

const limitOptional = (
  text: Optional<string>,
  max: number,
): Optional<string> => {
  return text === undefined ? undefined : truncateText(text, max);
};

export const limitDiscordEmbed = (embed: DiscordEmbed): DiscordEmbed => {
  return {
    ...embed,
    title: truncateText(embed.title, LIMITS.TITLE),
    description: limitOptional(embed.description, LIMITS.DESCRIPTION),
    fields: embed.fields?.slice(0, LIMITS.FIELDS).map((field) => {
      return {
        ...field,
        name: truncateText(field.name || EMPTY_VALUE, LIMITS.FIELD_NAME),
        value: truncateText(field.value || EMPTY_VALUE, LIMITS.FIELD_VALUE),
      };
    }),
    footer: embed.footer && {
      text: truncateText(embed.footer.text, LIMITS.FOOTER),
    },
  };
};
