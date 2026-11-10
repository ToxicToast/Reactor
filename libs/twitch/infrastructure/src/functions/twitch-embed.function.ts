import { PayloadReader } from '@toxictoast/shared-kernel';
import type {
  DiscordEmbed,
  DiscordEmbedRenderer,
} from '@toxictoast/shared-webhooks-infrastructure';
import { TWITCH_DISCORD } from '../constants/index.js';

/** Liest den Payload und färbt jedes Twitch-Embed lila. */
export const twitchEmbed = (
  render: (payload: PayloadReader) => DiscordEmbed,
): DiscordEmbedRenderer => {
  return (delivery) => {
    return {
      color: TWITCH_DISCORD.COLOR,
      ...render(new PayloadReader(delivery.payload)),
    };
  };
};
