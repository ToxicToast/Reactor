import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';

export interface PublishedLedger {
  /** Merkt sich die IDs und gibt nur die zurück, die vorher noch nicht bekannt waren. */
  markPublished(
    channelId: TwitchChannelId,
    ids: ReadonlyArray<string>,
  ): Promise<Array<string>>;
}
