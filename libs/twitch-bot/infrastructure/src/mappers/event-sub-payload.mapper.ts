import type {
  TwitchBanPayloadV1,
  TwitchChatMessageDeletedPayloadV1,
  TwitchChatMessagePayloadV1,
  TwitchCheerPayloadV1,
  TwitchFollowPayloadV1,
  TwitchGiftPayloadV1,
  TwitchPollPayloadV1,
  TwitchRaidPayloadV1,
  TwitchRedemptionPayloadV1,
  TwitchResubscribePayloadV1,
  TwitchRolePayloadV1,
  TwitchStreamOfflinePayloadV1,
  TwitchStreamOnlinePayloadV1,
  TwitchSubscribePayloadV1,
  TwitchUnbanPayloadV1,
} from '@toxictoast/contracts-events';
import type {
  EventSubChannelBanEvent,
  EventSubChannelChatMessageDeleteEvent,
  EventSubChannelChatMessageEvent,
  EventSubChannelCheerEvent,
  EventSubChannelFollowEvent,
  EventSubChannelModeratorEvent,
  EventSubChannelPollBeginEvent,
  EventSubChannelPollEndEvent,
  EventSubChannelPollProgressEvent,
  EventSubChannelRaidEvent,
  EventSubChannelRedemptionAddEvent,
  EventSubChannelSubscriptionEvent,
  EventSubChannelSubscriptionGiftEvent,
  EventSubChannelSubscriptionMessageEvent,
  EventSubChannelUnbanEvent,
  EventSubChannelVipEvent,
  EventSubStreamOnlineEvent,
} from '@twurple/eventsub-base';
import type { WithoutChannel } from '../types/index.js';

export class EventSubPayloadMapper {
  chatMessage(
    event: EventSubChannelChatMessageEvent,
  ): WithoutChannel<TwitchChatMessagePayloadV1> {
    return {
      message_id: event.messageId,
      user_id: event.chatterId,
      user_login: event.chatterName,
      user_name: event.chatterDisplayName,
      text: event.messageText,
      color: event.color,
      badges: Object.entries(event.badges).map(([set, version]) => {
        return `${set}/${version}`;
      }),
      bits: event.bits,
      reply_to_message_id: event.parentMessageId,
    };
  }

  chatMessageDeleted(
    event: EventSubChannelChatMessageDeleteEvent,
  ): WithoutChannel<TwitchChatMessageDeletedPayloadV1> {
    return {
      message_id: event.messageId,
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
    };
  }

  streamOnline(
    event: EventSubStreamOnlineEvent,
  ): WithoutChannel<TwitchStreamOnlinePayloadV1> {
    return {
      stream_id: event.id,
      type: event.type,
      started_at: event.startDate.toISOString(),
    };
  }

  streamOffline(): WithoutChannel<TwitchStreamOfflinePayloadV1> {
    return {};
  }

  follow(
    event: EventSubChannelFollowEvent,
  ): WithoutChannel<TwitchFollowPayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      followed_at: event.followDate.toISOString(),
    };
  }

  subscribe(
    event: EventSubChannelSubscriptionEvent,
  ): WithoutChannel<TwitchSubscribePayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      tier: event.tier,
      is_gift: event.isGift,
    };
  }

  resubscribe(
    event: EventSubChannelSubscriptionMessageEvent,
  ): WithoutChannel<TwitchResubscribePayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      tier: event.tier,
      cumulative_months: event.cumulativeMonths,
      streak_months: event.streakMonths,
      duration_months: event.durationMonths,
      message: event.messageText,
    };
  }

  gift(
    event: EventSubChannelSubscriptionGiftEvent,
  ): WithoutChannel<TwitchGiftPayloadV1> {
    return {
      user_id: event.gifterId,
      user_login: event.gifterName,
      user_name: event.gifterDisplayName,
      is_anonymous: event.isAnonymous,
      tier: event.tier,
      total: event.amount,
      cumulative_total: event.cumulativeAmount,
    };
  }

  raid(event: EventSubChannelRaidEvent): WithoutChannel<TwitchRaidPayloadV1> {
    return {
      from_channel_id: event.raidingBroadcasterId,
      from_channel_login: event.raidingBroadcasterName,
      from_channel_name: event.raidingBroadcasterDisplayName,
      viewers: event.viewers,
    };
  }

  cheer(
    event: EventSubChannelCheerEvent,
  ): WithoutChannel<TwitchCheerPayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      is_anonymous: event.isAnonymous,
      bits: event.bits,
      message: event.message,
    };
  }

  redemption(
    event: EventSubChannelRedemptionAddEvent,
  ): WithoutChannel<TwitchRedemptionPayloadV1> {
    return {
      redemption_id: event.id,
      reward_id: event.rewardId,
      reward_title: event.rewardTitle,
      reward_cost: event.rewardCost,
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      user_input: event.input,
      status: event.status,
      redeemed_at: event.redemptionDate.toISOString(),
    };
  }

  ban(event: EventSubChannelBanEvent): WithoutChannel<TwitchBanPayloadV1> {
    const endDate = event.endDate;
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      moderator_id: event.moderatorId,
      moderator_login: event.moderatorName,
      moderator_name: event.moderatorDisplayName,
      reason: event.reason,
      banned_at: event.startDate.toISOString(),
      ends_at: endDate === null ? null : endDate.toISOString(),
    };
  }

  unban(
    event: EventSubChannelUnbanEvent,
  ): WithoutChannel<TwitchUnbanPayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
      moderator_id: event.moderatorId,
      moderator_login: event.moderatorName,
      moderator_name: event.moderatorDisplayName,
    };
  }

  role(
    event: EventSubChannelModeratorEvent | EventSubChannelVipEvent,
  ): WithoutChannel<TwitchRolePayloadV1> {
    return {
      user_id: event.userId,
      user_login: event.userName,
      user_name: event.userDisplayName,
    };
  }

  pollStarted(
    event: EventSubChannelPollBeginEvent,
  ): WithoutChannel<TwitchPollPayloadV1> {
    return {
      poll_id: event.id,
      title: event.title,
      choices: event.choices.map((choice) => {
        return { id: choice.id, title: choice.title, votes: 0 };
      }),
      status: 'active',
      started_at: event.startDate.toISOString(),
      ends_at: event.endDate.toISOString(),
      ended_at: null,
    };
  }

  pollProgressed(
    event: EventSubChannelPollProgressEvent,
  ): WithoutChannel<TwitchPollPayloadV1> {
    return {
      poll_id: event.id,
      title: event.title,
      choices: event.choices.map((choice) => {
        return { id: choice.id, title: choice.title, votes: choice.totalVotes };
      }),
      status: 'active',
      started_at: event.startDate.toISOString(),
      ends_at: event.endDate.toISOString(),
      ended_at: null,
    };
  }

  pollEnded(
    event: EventSubChannelPollEndEvent,
  ): WithoutChannel<TwitchPollPayloadV1> {
    return {
      poll_id: event.id,
      title: event.title,
      choices: event.choices.map((choice) => {
        return { id: choice.id, title: choice.title, votes: choice.totalVotes };
      }),
      status: event.status,
      started_at: event.startDate.toISOString(),
      ends_at: event.endDate.toISOString(),
      ended_at: event.endDate.toISOString(),
    };
  }
}
