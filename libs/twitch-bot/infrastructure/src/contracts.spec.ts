import {
  TwitchBotEvents,
  TwitchCommunityEvents,
  TwitchTopics,
  type TwitchBotChannelPayloadV1,
  type TwitchFollowPayloadV1,
  type TwitchUnfollowPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  FOLLOWER_EVENTS,
  type ChannelReference,
  type FollowerPayload,
} from '@toxictoast/twitch-bot-application';
import {
  TwitchChannelEvents,
  type TwitchChannelEventPayload,
} from '@toxictoast/twitch-bot-domain';

describe('Event contracts', () => {
  it('match the serialized payload', () => {
    const checks: Array<true> = [
      true as Compatible<
        Jsonified<TwitchChannelEventPayload>,
        TwitchBotChannelPayloadV1
      >,
      true as Compatible<
        Jsonified<ChannelReference & FollowerPayload>,
        TwitchFollowPayloadV1
      >,
      true as Compatible<
        Jsonified<ChannelReference & FollowerPayload>,
        TwitchUnfollowPayloadV1
      >,
    ];

    expect(checks).toHaveLength(3);
  });

  it('publish the channel events under the contract topic and names', () => {
    expect(eventNamespacesOf(TwitchChannelEvents)).toEqual([TwitchTopics.BOT]);
    expect(eventNamesOf(TwitchChannelEvents)).toEqual(
      contractNamesOf(TwitchBotEvents),
    );
  });

  it('publish the follower sync under the community contract', () => {
    expect(FOLLOWER_EVENTS).toEqual({
      TOPIC: TwitchTopics.COMMUNITY,
      FOUND: TwitchCommunityEvents.FOLLOW_FOUND,
      UNFOLLOW: TwitchCommunityEvents.UNFOLLOW,
    });
  });
});
