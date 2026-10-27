import type {
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';

export interface TwitchEventSubscriber {
  /** Startet das Zuhören. Läuft es schon, wird neu gestartet (z. B. nach neuer Autorisierung). */
  start(channel: TwitchChannelAnemic): Promise<void>;
  stop(channelId: TwitchChannelId): Promise<void>;
}
