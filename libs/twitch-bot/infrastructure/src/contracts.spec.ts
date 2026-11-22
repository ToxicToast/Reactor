import {
  TwitchBotEvents,
  TwitchClipEvents,
  TwitchCommunityEvents,
  TwitchTopics,
  TwitchVideoEvents,
  type TwitchBotChannelPayloadV1,
  type TwitchClipPayloadV1,
  type TwitchFollowPayloadV1,
  type TwitchUnfollowPayloadV1,
  type TwitchVideoPayloadV1,
  TwitchVideoTypes as ContractVideoTypes,
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
  MEDIA_EVENTS,
  type ChannelReference,
  type FollowerPayload,
  type TwitchClip,
  type TwitchVideo,
  TwitchVideoTypes,
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
      true as Compatible<
        Jsonified<ChannelReference & TwitchClip>,
        TwitchClipPayloadV1
      >,
      true as Compatible<
        Jsonified<ChannelReference & TwitchVideo>,
        TwitchVideoPayloadV1
      >,
    ];

    expect(checks).toHaveLength(5);
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

  it('publish clips and videos under their contracts', () => {
    expect(MEDIA_EVENTS).toEqual({
      CLIP_TOPIC: TwitchTopics.CLIP,
      VIDEO_TOPIC: TwitchTopics.VIDEO,
      CREATED: TwitchClipEvents.CREATED,
      FOUND: TwitchClipEvents.FOUND,
      UPDATED: TwitchVideoEvents.UPDATED,
    });
    expect(TwitchVideoEvents.CREATED).toBe(MEDIA_EVENTS.CREATED);
    expect(TwitchVideoEvents.FOUND).toBe(MEDIA_EVENTS.FOUND);
    expect(TwitchVideoTypes).toEqual(ContractVideoTypes);
  });
});
