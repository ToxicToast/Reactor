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
    const owned = await this.listOwned();
    return [...owned, ...(await this.friendsWithout(owned))];
  }

  listOwned(): Promise<Array<TrackedChannel>> {
    return this.channels.findConnected();
  }

  async listFriends(): Promise<Array<TrackedChannel>> {
    return this.friendsWithout(await this.listOwned());
  }

  private async friendsWithout(
    owned: ReadonlyArray<TrackedChannel>,
  ): Promise<Array<TrackedChannel>> {
    const ownedIds = new Set(owned.map((channel) => channel.twitch_id));
    return (await this.friends.findList()).filter((friend) => {
      return !ownedIds.has(friend.twitch_id);
    });
  }
}
