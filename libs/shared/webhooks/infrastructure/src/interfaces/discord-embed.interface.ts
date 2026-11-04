import type { Optional } from '@toxictoast/shared-types';
import type { DiscordEmbedField } from './discord-embed-field.interface.js';
import type { DiscordEmbedFooter } from './discord-embed-footer.interface.js';
import type { DiscordEmbedImage } from './discord-embed-image.interface.js';

export interface DiscordEmbed {
  readonly title: string;
  readonly description?: Optional<string>;
  readonly url?: Optional<string>;
  readonly color?: Optional<number>;
  readonly timestamp?: Optional<string>;
  readonly fields?: Optional<ReadonlyArray<DiscordEmbedField>>;
  readonly image?: Optional<DiscordEmbedImage>;
  readonly thumbnail?: Optional<DiscordEmbedImage>;
  readonly footer?: Optional<DiscordEmbedFooter>;
}
