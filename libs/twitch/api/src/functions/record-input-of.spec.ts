import { InvalidPayloadError, PayloadReader } from '@toxictoast/shared-kernel';
import { ChatChangeKinds } from '@toxictoast/twitch-application';
import {
  ChatDeletionReasons,
  ObservationKinds,
} from '@toxictoast/twitch-domain';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { incomingTwitchEvent, TEST_VIEWER } from '../testing/index.js';
import { recordInputOf } from './record-input-of.function.js';

const OCCURRED_AT = new Date('2026-10-28T20:00:00.000Z');

const CHAT_PAYLOAD = {
  ...TEST_VIEWER,
  message_id: 'message-1',
  text: 'Hallo Chat',
  color: '#FF7F50',
  badges: ['subscriber'],
  bits: 50,
  reply_to_message_id: null,
};

const inputOf = (event: IncomingTwitchEvent) => {
  return recordInputOf(event, new PayloadReader(event.payload));
};

describe('recordInputOf', () => {
  it('maps a chat message with defaults', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.chat', 'message', CHAT_PAYLOAD),
    );

    expect(input.event).toMatchObject({
      topic: 'twitch.chat',
      name: 'message',
      channel_id: '123456',
      occurred_at: OCCURRED_AT,
    });
    expect(input.observation).toEqual({
      event_id: 'twitch.chat.message-1',
      kind: ObservationKinds.MESSAGE,
      channel: {
        channel_id: '123456',
        channel_login: 'toxictoast',
        channel_name: 'ToxicToast',
      },
      occurred_at: OCCURRED_AT,
      user: TEST_VIEWER,
      amount: 0,
      gifted: false,
      reward: null,
      poll: null,
      stream_id: null,
    });
    expect(input.chat).toEqual({
      kind: ChatChangeKinds.POSTED,
      message: {
        message_id: 'message-1',
        channel_id: '123456',
        ...TEST_VIEWER,
        text: 'Hallo Chat',
        color: '#FF7F50',
        badges: ['subscriber'],
        bits: 50,
        reply_to_message_id: null,
        sent_at: OCCURRED_AT,
      },
    });
  });

  it('maps deletions, bans and timeouts to chat changes', () => {
    const deleted = inputOf(
      incomingTwitchEvent('twitch.chat', 'message_deleted', {
        ...TEST_VIEWER,
        message_id: 'message-1',
      }),
    );
    const timeout = inputOf(
      incomingTwitchEvent('twitch.moderation', 'timeout', TEST_VIEWER),
    );

    expect(deleted.chat).toEqual({
      kind: ChatChangeKinds.DELETED,
      channel_id: '123456',
      message_id: 'message-1',
      at: OCCURRED_AT,
    });
    expect(timeout.chat).toEqual({
      kind: ChatChangeKinds.CLEARED,
      channel_id: '123456',
      user_id: '42',
      reason: ChatDeletionReasons.TIMED_OUT,
      at: OCCURRED_AT,
    });
    expect(timeout.observation).toBeNull();
  });

  it('starts sessions at the stream start, not at the observation', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.stream', 'online', {
        stream_id: 'stream-1',
        type: 'live',
        started_at: '2026-10-28T19:58:00.000Z',
      }),
    );

    expect(input.observation).toMatchObject({
      kind: ObservationKinds.STREAM_ONLINE,
      stream_id: 'stream-1',
      occurred_at: new Date('2026-10-28T19:58:00.000Z'),
    });
  });

  it('keeps anonymous cheers without a viewer', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.community', 'cheer', {
        user_id: null,
        user_login: null,
        user_name: null,
        is_anonymous: true,
        bits: 500,
        message: '',
      }),
    );

    expect(input.observation).toMatchObject({
      kind: ObservationKinds.CHEER,
      user: null,
      amount: 500,
    });
  });

  it('marks gifted subscriptions', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.community', 'subscribe', {
        ...TEST_VIEWER,
        tier: '1000',
        is_gift: true,
      }),
    );

    expect(input.observation).toMatchObject({
      kind: ObservationKinds.SUBSCRIPTION,
      gifted: true,
    });
  });

  it('maps redemptions with their reward', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.redemption', 'redeemed', {
        ...TEST_VIEWER,
        redemption_id: 'redemption-1',
        reward_id: 'reward-1',
        reward_title: 'Hydrate',
        reward_cost: 500,
        user_input: '',
        status: 'fulfilled',
        redeemed_at: '2026-10-28T20:00:00.000Z',
      }),
    );

    expect(input.observation?.reward).toEqual({
      reward_id: 'reward-1',
      title: 'Hydrate',
      cost: 500,
    });
  });

  it('maps every poll event to a poll snapshot', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.poll', 'progressed', {
        poll_id: 'poll-1',
        title: 'Next game?',
        choices: [{ id: 'choice-1', title: 'Warcraft', votes: 3 }],
        status: 'ACTIVE',
        started_at: '2026-10-28T19:00:00.000Z',
        ends_at: '2026-10-28T19:05:00.000Z',
        ended_at: null,
      }),
    );

    expect(input.observation?.poll).toEqual({
      poll_id: 'poll-1',
      title: 'Next game?',
      choices: [{ id: 'choice-1', title: 'Warcraft', votes: 3 }],
      status: 'ACTIVE',
      started_at: new Date('2026-10-28T19:00:00.000Z'),
      ends_at: new Date('2026-10-28T19:05:00.000Z'),
      ended_at: null,
    });
  });

  it('records events without stats effect without an observation', () => {
    const input = inputOf(
      incomingTwitchEvent('twitch.clip', 'created', { clip_id: 'clip-1' }),
    );

    expect(input.observation).toBeNull();
    expect(input.event.channel_id).toBe('123456');
  });

  it('takes the twitch id of bot events as channel', () => {
    const input = inputOf({
      event_id: 'bot-1',
      event_namespace: 'twitch.bot',
      event_name: 'channel_connected',
      occurred_at: '2026-10-28T20:00:00.000Z',
      payload: { id: 'uuid', twitch_id: '123456', login: 'toxictoast' },
    });

    expect(input.event.channel_id).toBe('123456');
    expect(input.observation).toBeNull();
  });

  it('rejects malformed payloads', () => {
    expect(() => {
      return inputOf(
        incomingTwitchEvent('twitch.chat', 'message', { user_id: 42 }),
      );
    }).toThrow(InvalidPayloadError);
    expect(() => {
      return inputOf({
        ...incomingTwitchEvent('twitch.chat', 'message'),
        occurred_at: 'gestern',
      });
    }).toThrow(InvalidPayloadError);
  });
});
