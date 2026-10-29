import {
  postedChatMessage,
  TWITCH_TEST_CHANNEL,
} from '@toxictoast/twitch-application';
import {
  ChatDeletionReasons,
  type ChatMessage,
  type ChatMessageFilter,
} from '@toxictoast/twitch-domain';
import { TwitchTestDatabase } from '../testing/index.js';
import { TypeOrmChatMessageRepository } from './typeorm-chat-message.repository.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;
const SESSION_ID = '0192f3a0-0000-7000-8000-0000000005c1';

const at = (value: string): Date => new Date(`2026-10-${value}Z`);

const message = (
  id: string,
  overrides: Partial<ChatMessage> = {},
): ChatMessage => {
  return {
    ...postedChatMessage(id),
    badges: ['subscriber'],
    session_id: null,
    deleted_at: null,
    deleted_reason: null,
    ...overrides,
  };
};

const FILTER: ChatMessageFilter = {
  channel_id: CHANNEL_ID,
  user_id: null,
  session_id: null,
  query: null,
  include_deleted: false,
  from: null,
  to: null,
};

describe('twitch chat persistence', () => {
  const database = new TwitchTestDatabase();
  let messages: TypeOrmChatMessageRepository;

  const ids = async (filter: Partial<ChatMessageFilter> = {}) => {
    const found = await messages.list({ ...FILTER, ...filter }, 100);
    return found.map((entry) => entry.message_id);
  };

  beforeAll(async () => {
    await database.start();
    messages = new TypeOrmChatMessageRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('stores a message once with all fields', async () => {
    const stored = message('m1', {
      color: '#FF7F50',
      bits: 100,
      reply_to_message_id: 'm0',
      session_id: SESSION_ID,
    });

    expect(await messages.record(stored)).toBe(true);
    expect(await messages.record(stored)).toBe(false);
    expect(await messages.list(FILTER, 10)).toEqual([stored]);
  });

  it('marks single messages and recent messages of a user', async () => {
    await messages.record(message('old', { sent_at: at('26T19:00:00') }));
    await messages.record(message('recent', { sent_at: at('28T18:00:00') }));
    await messages.record(
      message('other', { sent_at: at('28T18:30:00'), user_id: '2' }),
    );
    await messages.record(
      message('single', { sent_at: at('28T18:45:00'), user_id: '2' }),
    );

    await messages.markDeleted(
      CHANNEL_ID,
      'single',
      at('28T19:00:00'),
      ChatDeletionReasons.DELETED,
    );
    const cleared = await messages.markUserCleared(
      CHANNEL_ID,
      '1',
      at('27T19:00:00'),
      at('28T19:00:00'),
      ChatDeletionReasons.TIMED_OUT,
    );

    expect(cleared).toBe(1);
    expect(await ids()).toEqual(['other', 'old']);
    expect(await ids({ include_deleted: true })).toEqual([
      'single',
      'other',
      'recent',
      'old',
    ]);
  });

  it('keeps the first deletion reason', async () => {
    await messages.record(message('m1'));
    await messages.markDeleted(
      CHANNEL_ID,
      'm1',
      at('28T19:00:00'),
      ChatDeletionReasons.DELETED,
    );
    await messages.markUserCleared(
      CHANNEL_ID,
      '1',
      at('27T00:00:00'),
      at('28T19:05:00'),
      ChatDeletionReasons.BANNED,
    );

    const [stored] = await messages.list(
      { ...FILTER, include_deleted: true },
      10,
    );
    expect(stored.deleted_reason).toBe(ChatDeletionReasons.DELETED);
  });

  it('filters by viewer, session, range and full text', async () => {
    await messages.record(
      message('m1', {
        sent_at: at('27T19:00:00'),
        text: 'Hallo Chat, heute Warcraft',
      }),
    );
    await messages.record(
      message('m2', {
        sent_at: at('28T19:00:00'),
        text: 'hallo toast',
        user_id: '2',
        session_id: SESSION_ID,
      }),
    );
    await messages.record(
      message('m3', { sent_at: at('28T19:05:00'), text: 'gute Nacht' }),
    );

    expect(await ids({ user_id: '1' })).toEqual(['m3', 'm1']);
    expect(await ids({ session_id: SESSION_ID })).toEqual(['m2']);
    expect(await ids({ from: at('28T00:00:00') })).toEqual(['m3', 'm2']);
    expect(await ids({ query: 'hallo' })).toEqual(['m2', 'm1']);
    expect(await ids({ query: 'hallo -toast' })).toEqual(['m1']);
    expect(await ids({ query: '"gute nacht"' })).toEqual(['m3']);
  });
});
