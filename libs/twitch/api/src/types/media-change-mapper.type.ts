import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { MediaChange } from '@toxictoast/twitch-application';

export type MediaChangeMapper = (payload: PayloadReader) => MediaChange;
