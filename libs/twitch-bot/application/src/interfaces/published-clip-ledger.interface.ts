import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';

export interface PublishedClipLedger {
  /** Merkt sich die Clips und gibt nur die zurück, die vorher noch nicht bekannt waren. */
  markPublished(
    channelId: TwitchChannelId,
    clipIds: ReadonlyArray<string>,
  ): Promise<Array<string>>;
}
