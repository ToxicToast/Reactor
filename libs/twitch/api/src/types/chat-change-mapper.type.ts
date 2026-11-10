import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { ChatChange } from '@toxictoast/twitch-application';

export type ChatChangeMapper = (payload: PayloadReader, at: Date) => ChatChange;
