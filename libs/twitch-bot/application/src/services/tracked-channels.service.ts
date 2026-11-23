import type {
  TrackedChannel,
  TwitchChannelRepository,
  TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';

export class TrackedChannels {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly friends: TwitchFriendRepository,
  ) {}

  /** Eigene Channels zuerst; wer verbunden ist, zählt nicht zusätzlich als Freund. */
  async list(): Promise<Array<TrackedChannel>> {
    const owned = await this.channels.findConnected();
    const ownedIds = new Set(owned.map((channel) => channel.twitch_id));
    const friends = (await this.friends.findList()).filter((friend) => {
      return !ownedIds.has(friend.twitch_id);
    });
    return [...owned, ...friends];
  }
}
