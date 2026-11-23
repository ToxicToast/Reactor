import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';

export interface PublishedLedger {
  /** Merkt sich die IDs und gibt nur die zurück, die vorher noch nicht bekannt waren. */
  markPublished(
    channelId: TrackedChannelId,
    ids: ReadonlyArray<string>,
  ): Promise<Array<string>>;
}
