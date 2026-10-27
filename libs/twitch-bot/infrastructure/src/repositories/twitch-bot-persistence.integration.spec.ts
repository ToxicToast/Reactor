import { randomBytes } from 'node:crypto';
import {
  FakeTwitchAuthClient,
  twitchChannelAnemic,
} from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import { TokenCipher } from '../services/index.js';
import { PostgresTestDatabase } from '../testing/index.js';
import { TypeOrmChatterRepository } from './typeorm-chatter.repository.js';
import { TypeOrmPublishedClipLedger } from './typeorm-published-clip.ledger.js';
import { TypeOrmTwitchChannelRepository } from './typeorm-twitch-channel.repository.js';
import { TypeOrmTwitchTokenStore } from './typeorm-twitch-token.store.js';

const CHANNEL_ID = '0192f3a0-0000-7000-8000-000000000c01' as TwitchChannelId;
const OTHER_ID = '0192f3a0-0000-7000-8000-000000000c02' as TwitchChannelId;
const NOW = new Date('2026-10-26T20:00:00Z');
const clock = { now: () => NOW };

const chatter = (id: string) => ({
  user_id: id,
  user_login: `user${id}`,
  user_name: `User${id}`,
});

describe('twitch-bot persistence', () => {
  const database = new PostgresTestDatabase();
  let channels: TypeOrmTwitchChannelRepository;
  let chatters: TypeOrmChatterRepository;
  let tokens: TypeOrmTwitchTokenStore;
  let ledger: TypeOrmPublishedClipLedger;

  beforeAll(async () => {
    await database.start();
    channels = new TypeOrmTwitchChannelRepository(
      database.dataSource,
      database.context,
    );
    chatters = new TypeOrmChatterRepository(
      database.dataSource,
      database.context,
    );
    tokens = new TypeOrmTwitchTokenStore(
      database.dataSource,
      database.context,
      new TokenCipher(randomBytes(32)),
      clock,
    );
    ledger = new TypeOrmPublishedClipLedger(
      database.dataSource,
      database.context,
      clock,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('has migrations that match the schemas', async () => {
    const sql = await database.dataSource.driver.createSchemaBuilder().log();

    expect(sql.upQueries).toEqual([]);
  });

  describe('channels', () => {
    it('saves and loads a channel by id and twitch id', async () => {
      const channel = twitchChannelAnemic(CHANNEL_ID);

      await channels.save(channel);

      expect(await channels.findById(CHANNEL_ID)).toEqual(channel);
      expect(await channels.findByTwitchId('123456')).toEqual(channel);
      expect(await channels.findByTwitchId('999')).toBeNull();
    });

    it('finds only connected channels', async () => {
      await channels.save(twitchChannelAnemic(CHANNEL_ID));
      await channels.save(
        twitchChannelAnemic(OTHER_ID, {
          twitch_id: '654321',
          connected: false,
        }),
      );

      const connected = await channels.findConnected();

      expect(connected.map((channel) => channel.id)).toEqual([CHANNEL_ID]);
    });
  });

  describe('chatters', () => {
    it('replaces the snapshot of a channel', async () => {
      await chatters.replace(CHANNEL_ID, [chatter('1'), chatter('2')]);
      await chatters.replace(OTHER_ID, [chatter('9')]);

      await chatters.replace(CHANNEL_ID, [chatter('2'), chatter('3')]);

      expect(await chatters.findByChannel(CHANNEL_ID)).toEqual([
        chatter('2'),
        chatter('3'),
      ]);
      expect(await chatters.findByChannel(OTHER_ID)).toEqual([chatter('9')]);
    });

    it('empties the snapshot', async () => {
      await chatters.replace(CHANNEL_ID, [chatter('1')]);

      await chatters.replace(CHANNEL_ID, []);

      expect(await chatters.findByChannel(CHANNEL_ID)).toEqual([]);
    });
  });

  describe('tokens', () => {
    const token = new FakeTwitchAuthClient().authorization.token;

    it('stores tokens encrypted and reads them back', async () => {
      await tokens.save(CHANNEL_ID, token);

      const [row] = await database.dataSource.query(
        'SELECT access_token, refresh_token FROM twitch_tokens',
      );
      expect(row.access_token).not.toBe(token.access_token);
      expect(row.refresh_token).not.toBe(token.refresh_token);
      expect(await tokens.find(CHANNEL_ID)).toEqual(token);
    });

    it('overwrites the token of a channel', async () => {
      await tokens.save(CHANNEL_ID, token);

      await tokens.save(CHANNEL_ID, { ...token, access_token: 'neu' });

      expect((await tokens.find(CHANNEL_ID))?.access_token).toBe('neu');
    });

    it('removes the token of a channel', async () => {
      await tokens.save(CHANNEL_ID, token);

      await tokens.remove(CHANNEL_ID);

      expect(await tokens.find(CHANNEL_ID)).toBeNull();
    });
  });

  describe('published clips', () => {
    it('returns only clips that were not known before', async () => {
      expect(await ledger.markPublished(CHANNEL_ID, ['a', 'b', 'a'])).toEqual([
        'a',
        'b',
      ]);
      expect(await ledger.markPublished(CHANNEL_ID, ['b', 'c'])).toEqual(['c']);
      expect(await ledger.markPublished(OTHER_ID, ['a'])).toEqual(['a']);
    });
  });
});
