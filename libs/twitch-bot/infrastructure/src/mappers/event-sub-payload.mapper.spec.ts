import type {
  EventSubChannelBanEvent,
  EventSubChannelChatMessageEvent,
  EventSubChannelPollBeginEvent,
  EventSubChannelPollEndEvent,
  EventSubChannelRaidEvent,
  EventSubChannelSubscriptionGiftEvent,
} from '@twurple/eventsub-base';
import { EventSubPayloadMapper } from './event-sub-payload.mapper.js';

const fake = <T>(value: object): T => value as unknown as T;

const START = new Date('2026-10-26T20:00:00Z');
const END = new Date('2026-10-26T20:10:00Z');

describe('EventSubPayloadMapper', () => {
  const mapper = new EventSubPayloadMapper();

  it('maps a chat message with badges and reply', () => {
    const event = fake<EventSubChannelChatMessageEvent>({
      messageId: 'msg-1',
      chatterId: '42',
      chatterName: 'viewer',
      chatterDisplayName: 'Viewer',
      messageText: 'Hallo',
      color: '#FF0000',
      badges: { subscriber: '12', vip: '1' },
      bits: 0,
      parentMessageId: 'msg-0',
    });

    expect(mapper.chatMessage(event)).toEqual({
      message_id: 'msg-1',
      user_id: '42',
      user_login: 'viewer',
      user_name: 'Viewer',
      text: 'Hallo',
      color: '#FF0000',
      badges: ['subscriber/12', 'vip/1'],
      bits: 0,
      reply_to_message_id: 'msg-0',
    });
  });

  it('maps a timeout with its end and a ban without', () => {
    const base = {
      userId: '42',
      userName: 'viewer',
      userDisplayName: 'Viewer',
      moderatorId: '7',
      moderatorName: 'mod',
      moderatorDisplayName: 'Mod',
      reason: 'spam',
      startDate: START,
    };

    expect(
      mapper.ban(fake<EventSubChannelBanEvent>({ ...base, endDate: END })),
    ).toMatchObject({
      banned_at: START.toISOString(),
      ends_at: END.toISOString(),
    });
    expect(
      mapper.ban(fake<EventSubChannelBanEvent>({ ...base, endDate: null }))
        .ends_at,
    ).toBeNull();
  });

  it('maps an anonymous gift without user', () => {
    const event = fake<EventSubChannelSubscriptionGiftEvent>({
      gifterId: null,
      gifterName: null,
      gifterDisplayName: null,
      isAnonymous: true,
      tier: '1000',
      amount: 5,
      cumulativeAmount: null,
    });

    expect(mapper.gift(event)).toEqual({
      user_id: null,
      user_login: null,
      user_name: null,
      is_anonymous: true,
      tier: '1000',
      total: 5,
      cumulative_total: null,
    });
  });

  it('maps the raiding channel', () => {
    const event = fake<EventSubChannelRaidEvent>({
      raidingBroadcasterId: '99',
      raidingBroadcasterName: 'raider',
      raidingBroadcasterDisplayName: 'Raider',
      viewers: 120,
    });

    expect(mapper.raid(event)).toEqual({
      from_channel_id: '99',
      from_channel_login: 'raider',
      from_channel_name: 'Raider',
      viewers: 120,
    });
  });

  it('starts a poll without votes', () => {
    const event = fake<EventSubChannelPollBeginEvent>({
      id: 'poll-1',
      title: 'Pizza?',
      choices: [{ id: 'c1', title: 'Ja' }],
      startDate: START,
      endDate: END,
    });

    expect(mapper.pollStarted(event)).toEqual({
      poll_id: 'poll-1',
      title: 'Pizza?',
      choices: [{ id: 'c1', title: 'Ja', votes: 0 }],
      status: 'active',
      started_at: START.toISOString(),
      ends_at: END.toISOString(),
      ended_at: null,
    });
  });

  it('ends a poll with votes and status', () => {
    const event = fake<EventSubChannelPollEndEvent>({
      id: 'poll-1',
      title: 'Pizza?',
      choices: [{ id: 'c1', title: 'Ja', totalVotes: 7 }],
      status: 'completed',
      startDate: START,
      endDate: END,
    });

    expect(mapper.pollEnded(event)).toMatchObject({
      choices: [{ id: 'c1', title: 'Ja', votes: 7 }],
      status: 'completed',
      ended_at: END.toISOString(),
    });
  });

  it('maps stream offline to an empty payload', () => {
    expect(mapper.streamOffline()).toEqual({});
  });
});
