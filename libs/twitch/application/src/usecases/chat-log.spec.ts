import {
  ChatDeletionReasons,
  ObservationKinds,
} from '@toxictoast/twitch-domain';
import { ChatChangeKinds } from '../constants/index.js';
import {
  observation,
  postedChatMessage,
  TWITCH_TEST_CHANNEL,
  TwitchTestHarness,
} from '../testing/index.js';
import { ListChatMessagesUseCase } from './list-chat-messages.usecase.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;

const at = (value: string): Date => new Date(`2026-10-${value}Z`);

describe('chat log', () => {
  let harness: TwitchTestHarness;
  let list: ListChatMessagesUseCase;

  const post = (
    id: string,
    sentAt: Date,
    userId = '1',
    text = `message ${id}`,
  ) => {
    return harness.chat({
      kind: ChatChangeKinds.POSTED,
      message: postedChatMessage(id, {
        sent_at: sentAt,
        user_id: userId,
        user_login: `user${userId}`,
        user_name: `User${userId}`,
        text,
      }),
    });
  };

  const ids = async (
    input: Partial<Parameters<ListChatMessagesUseCase['execute']>[0]> = {},
  ) => {
    const result = await list.execute({
      channel_id: CHANNEL_ID,
      limit: 100,
      ...input,
    });
    return result.value.map((message) => message.message_id);
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
    list = new ListChatMessagesUseCase(harness.chatMessages);
  });

  it('stores a message once and links it to the live session', async () => {
    await harness.observe(
      observation({
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: 'stream-1',
        occurred_at: at('28T19:00:00'),
      }),
      'twitch.stream',
      'online',
    );
    await post('m1', at('28T19:30:00'));
    await post('m1', at('28T19:30:00'));

    const live = await harness.sessions.findLive(CHANNEL_ID);
    expect(harness.chatMessages.items.size).toBe(1);
    expect(harness.chatMessages.items.get('m1')?.session_id).toBe(live?.id);
  });

  it('marks deleted messages and hides them unless requested', async () => {
    await post('m1', at('28T19:00:00'));
    await post('m2', at('28T19:01:00'));
    await harness.chat({
      kind: ChatChangeKinds.DELETED,
      channel_id: CHANNEL_ID,
      message_id: 'm1',
      at: at('28T19:02:00'),
    });

    expect(await ids()).toEqual(['m2']);
    expect(await ids({ include_deleted: true })).toEqual(['m2', 'm1']);
    expect(harness.chatMessages.items.get('m1')?.deleted_reason).toBe(
      ChatDeletionReasons.DELETED,
    );
  });

  it('clears the recent messages of a banned user only', async () => {
    await post('old', at('26T19:00:00'));
    await post('recent', at('28T18:00:00'));
    await post('other', at('28T18:30:00'), '2');
    await harness.chat({
      kind: ChatChangeKinds.CLEARED,
      channel_id: CHANNEL_ID,
      user_id: '1',
      reason: ChatDeletionReasons.BANNED,
      at: at('28T19:00:00'),
    });

    expect(await ids()).toEqual(['other', 'old']);
    expect(harness.chatMessages.items.get('recent')?.deleted_reason).toBe(
      ChatDeletionReasons.BANNED,
    );
  });

  it('filters by viewer, range and search text', async () => {
    await post('m1', at('27T19:00:00'), '1', 'Hallo Chat');
    await post('m2', at('28T19:00:00'), '2', 'hallo toast');
    await post('m3', at('28T19:05:00'), '1', 'gute Nacht');

    expect(await ids({ user_id: '1' })).toEqual(['m3', 'm1']);
    expect(await ids({ from: at('28T00:00:00') })).toEqual(['m3', 'm2']);
    expect(await ids({ query: '  hallo ' })).toEqual(['m2', 'm1']);
  });

  it('refuses overly long search queries', async () => {
    const result = await list.execute({
      channel_id: CHANNEL_ID,
      query: 'x'.repeat(201),
    });

    expect(result.error.code).toBe('VALIDATION');
  });
});
