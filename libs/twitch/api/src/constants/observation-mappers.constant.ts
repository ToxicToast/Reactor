import {
  TwitchChatEvents,
  TwitchCommunityEvents,
  TwitchPollEvents,
  TwitchPresenceEvents,
  TwitchRedemptionEvents,
  TwitchStreamEvents,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';
import {
  ObservationKinds,
  type ObservationKindValue,
} from '@toxictoast/twitch-domain';
import { optionalViewerOf, pollOf, viewerOf } from '../functions/index.js';
import type { ObservationMapper } from '../types/index.js';

const withViewer = (kind: ObservationKindValue): ObservationMapper => {
  return (payload) => ({ kind, user: viewerOf(payload) });
};

const withFollower = (kind: ObservationKindValue): ObservationMapper => {
  return (payload) => ({
    kind,
    user: viewerOf(payload),
    followed_at: payload.date('followed_at'),
  });
};

const poll: ObservationMapper = (payload) => {
  return { kind: ObservationKinds.POLL, poll: pollOf(payload) };
};

/** Events ohne Eintrag (Moderation, Clips, Bot, Sessions) landen nur im Event-Log, in Webhooks und im Feed. */
export const OBSERVATION_MAPPERS: Readonly<Record<string, ObservationMapper>> =
  {
    [eventKey(TwitchTopics.CHAT, TwitchChatEvents.MESSAGE)]: withViewer(
      ObservationKinds.MESSAGE,
    ),
    [eventKey(TwitchTopics.STREAM, TwitchStreamEvents.ONLINE)]: (payload) => {
      return {
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: payload.string('stream_id'),
        occurred_at: payload.date('started_at'),
      };
    },
    [eventKey(TwitchTopics.STREAM, TwitchStreamEvents.OFFLINE)]: () => {
      return { kind: ObservationKinds.STREAM_OFFLINE };
    },
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.FOLLOW)]:
      withFollower(ObservationKinds.FOLLOW),
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.FOLLOW_FOUND)]:
      withFollower(ObservationKinds.FOLLOW_FOUND),
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.UNFOLLOW)]:
      withFollower(ObservationKinds.UNFOLLOW),
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.SUBSCRIBE)]: (
      payload,
    ) => {
      return {
        kind: ObservationKinds.SUBSCRIPTION,
        user: viewerOf(payload),
        gifted: payload.boolean('is_gift'),
      };
    },
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.RESUBSCRIBE)]:
      withViewer(ObservationKinds.RESUBSCRIPTION),
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.GIFT)]: (
      payload,
    ) => {
      return {
        kind: ObservationKinds.GIFT,
        user: optionalViewerOf(payload),
        amount: payload.number('total'),
      };
    },
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.RAID)]: (
      payload,
    ) => {
      return {
        kind: ObservationKinds.RAID,
        amount: payload.number('viewers'),
      };
    },
    [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.CHEER)]: (
      payload,
    ) => {
      return {
        kind: ObservationKinds.CHEER,
        user: optionalViewerOf(payload),
        amount: payload.number('bits'),
      };
    },
    [eventKey(TwitchTopics.REDEMPTION, TwitchRedemptionEvents.REDEEMED)]: (
      payload,
    ) => {
      return {
        kind: ObservationKinds.REDEMPTION,
        user: viewerOf(payload),
        reward: {
          reward_id: payload.string('reward_id'),
          title: payload.string('reward_title'),
          cost: payload.number('reward_cost'),
        },
      };
    },
    [eventKey(TwitchTopics.PRESENCE, TwitchPresenceEvents.JOINED)]: withViewer(
      ObservationKinds.JOIN,
    ),
    [eventKey(TwitchTopics.PRESENCE, TwitchPresenceEvents.LEFT)]: withViewer(
      ObservationKinds.LEAVE,
    ),
    ...Object.fromEntries(
      Object.values(TwitchPollEvents).map((name) => {
        return [eventKey(TwitchTopics.POLL, name), poll];
      }),
    ),
  };
