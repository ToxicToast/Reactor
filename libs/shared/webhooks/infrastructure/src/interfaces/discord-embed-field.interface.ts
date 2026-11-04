import type { Optional } from '@toxictoast/shared-types';

export interface DiscordEmbedField {
  readonly name: string;
  readonly value: string;
  readonly inline?: Optional<boolean>;
}
