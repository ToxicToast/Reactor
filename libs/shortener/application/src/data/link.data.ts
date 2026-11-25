import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { LinkId } from '@toxictoast/shortener-domain';

export interface CreateLinkInput {
  readonly target_url: string;
  readonly description: Nullable<string>;
}

export interface UpdateLinkInput {
  readonly id: LinkId;
  readonly target_url: string;
  readonly description: Nullable<string>;
  readonly active: boolean;
}

export interface LinkIdInput {
  readonly id: LinkId;
  readonly withDeleted?: Optional<boolean>;
}

export interface ListLinksInput {
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
  readonly withDeleted?: Optional<boolean>;
}

export interface ResolveLinkInput {
  readonly id: LinkId;
}

export interface ResolveLinkOutput {
  readonly target_url: string;
}
