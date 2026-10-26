import type { EventSubSubscription } from '@twurple/eventsub-base';
import type { EventSubWsListener } from '@twurple/eventsub-ws';
import {
  TwitchChatEvents,
  TwitchCommunityEvents,
  TwitchModerationEvents,
  TwitchPollEvents,
  TwitchRedemptionEvents,
  TwitchStreamEvents,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  PublishTwitchEventUseCase,
  TwitchEventSubscriber,
} from '@toxictoast/twitch-bot-application';
import type {
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import { createEventSubListener } from '../factories/index.js';
import type { ActiveSubscription } from '../interfaces/index.js';
import { EventSubPayloadMapper } from '../mappers/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleEventSubscriber implements TwitchEventSubscriber {
  private readonly mapper = new EventSubPayloadMapper();
  private readonly active = new Map<TwitchChannelId, ActiveSubscription>();
  private listener: Nullable<Promise<EventSubWsListener>> = null;

  constructor(
    private readonly connection: TwitchConnection,
    private readonly publisher: PublishTwitchEventUseCase,
    private readonly onError: (error: unknown, context: string) => void = () =>
      undefined,
  ) {}

  async start(channel: TwitchChannelAnemic): Promise<void> {
    await this.stop(channel.id);
    await this.connection.reload(channel);
    const listener = await this.ensureListener();
    this.active.set(channel.id, {
      channel,
      subscriptions: this.subscribe(listener, channel),
    });
  }

  async stop(channelId: TwitchChannelId): Promise<void> {
    const active = this.active.get(channelId);
    if (!active) {
      return;
    }

    for (const subscription of active.subscriptions) {
      subscription.stop();
    }
    this.active.delete(channelId);
    await this.connection.forget(active.channel);
  }

  async close(): Promise<void> {
    for (const channelId of [...this.active.keys()]) {
      await this.stop(channelId);
    }
    if (this.listener) {
      const listener = await this.listener;
      listener.stop();
      this.listener = null;
    }
  }

  private ensureListener(): Promise<EventSubWsListener> {
    if (!this.listener) {
      this.listener = this.createListener().catch((error: unknown) => {
        this.listener = null;
        throw error;
      });
    }
    return this.listener;
  }

  private async createListener(): Promise<EventSubWsListener> {
    const listener = await createEventSubListener(await this.connection.api());
    listener.onSubscriptionCreateFailure((subscription, error) => {
      this.onError(error, `Creating subscription ${subscription.id} failed`);
    });
    listener.onRevoke((subscription, status) => {
      this.onError(
        new Error(status),
        `Twitch revoked subscription ${subscription.id}`,
      );
    });
    listener.start();
    return listener;
  }

  private subscribe(
    listener: EventSubWsListener,
    channel: TwitchChannelAnemic,
  ): Array<EventSubSubscription> {
    const id = channel.twitch_id;
    const mapper = this.mapper;
    const emit = (topic: string, name: string, payload: object): void => {
      this.publisher
        .execute({ channel, topic, name, payload })
        .catch((error: unknown) => {
          this.onError(error, `Publishing ${topic}.${name} failed`);
        });
    };

    const { CHAT, STREAM, COMMUNITY, REDEMPTION, MODERATION, POLL } =
      TwitchTopics;

    return [
      listener.onChannelChatMessage(id, id, (event) => {
        emit(CHAT, TwitchChatEvents.MESSAGE, mapper.chatMessage(event));
      }),
      listener.onChannelChatMessageDelete(id, id, (event) => {
        emit(
          CHAT,
          TwitchChatEvents.MESSAGE_DELETED,
          mapper.chatMessageDeleted(event),
        );
      }),
      listener.onStreamOnline(id, (event) => {
        emit(STREAM, TwitchStreamEvents.ONLINE, mapper.streamOnline(event));
      }),
      listener.onStreamOffline(id, () => {
        emit(STREAM, TwitchStreamEvents.OFFLINE, mapper.streamOffline());
      }),
      listener.onChannelFollow(id, id, (event) => {
        emit(COMMUNITY, TwitchCommunityEvents.FOLLOW, mapper.follow(event));
      }),
      listener.onChannelSubscription(id, (event) => {
        emit(
          COMMUNITY,
          TwitchCommunityEvents.SUBSCRIBE,
          mapper.subscribe(event),
        );
      }),
      listener.onChannelSubscriptionMessage(id, (event) => {
        emit(
          COMMUNITY,
          TwitchCommunityEvents.RESUBSCRIBE,
          mapper.resubscribe(event),
        );
      }),
      listener.onChannelSubscriptionGift(id, (event) => {
        emit(COMMUNITY, TwitchCommunityEvents.GIFT, mapper.gift(event));
      }),
      listener.onChannelRaidTo(id, (event) => {
        emit(COMMUNITY, TwitchCommunityEvents.RAID, mapper.raid(event));
      }),
      listener.onChannelCheer(id, (event) => {
        emit(COMMUNITY, TwitchCommunityEvents.CHEER, mapper.cheer(event));
      }),
      listener.onChannelRedemptionAdd(id, (event) => {
        emit(
          REDEMPTION,
          TwitchRedemptionEvents.REDEEMED,
          mapper.redemption(event),
        );
      }),
      listener.onChannelBan(id, (event) => {
        emit(
          MODERATION,
          event.isPermanent
            ? TwitchModerationEvents.BAN
            : TwitchModerationEvents.TIMEOUT,
          mapper.ban(event),
        );
      }),
      listener.onChannelUnban(id, (event) => {
        emit(MODERATION, TwitchModerationEvents.UNBAN, mapper.unban(event));
      }),
      listener.onChannelModeratorAdd(id, (event) => {
        emit(
          MODERATION,
          TwitchModerationEvents.MODERATOR_ADDED,
          mapper.role(event),
        );
      }),
      listener.onChannelModeratorRemove(id, (event) => {
        emit(
          MODERATION,
          TwitchModerationEvents.MODERATOR_REMOVED,
          mapper.role(event),
        );
      }),
      listener.onChannelVipAdd(id, (event) => {
        emit(MODERATION, TwitchModerationEvents.VIP_ADDED, mapper.role(event));
      }),
      listener.onChannelVipRemove(id, (event) => {
        emit(
          MODERATION,
          TwitchModerationEvents.VIP_REMOVED,
          mapper.role(event),
        );
      }),
      listener.onChannelPollBegin(id, (event) => {
        emit(POLL, TwitchPollEvents.STARTED, mapper.pollStarted(event));
      }),
      listener.onChannelPollProgress(id, (event) => {
        emit(POLL, TwitchPollEvents.PROGRESSED, mapper.pollProgressed(event));
      }),
      listener.onChannelPollEnd(id, (event) => {
        emit(POLL, TwitchPollEvents.ENDED, mapper.pollEnded(event));
      }),
    ];
  }
}
