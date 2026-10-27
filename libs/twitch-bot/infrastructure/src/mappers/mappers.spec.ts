import { randomBytes } from 'node:crypto';
import {
  FakeTwitchAuthClient,
  twitchChannelAnemic,
} from '@toxictoast/twitch-bot-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import { TokenCipher } from '../services/token-cipher.service.js';
import { TwitchAccessTokenMapper } from './twitch-access-token.mapper.js';
import { TwitchChannelMapper } from './twitch-channel.mapper.js';
import { TwitchTokenMapper } from './twitch-token.mapper.js';

const TOKEN = new FakeTwitchAuthClient().authorization.token;

describe('TwitchChannelMapper', () => {
  it('maps an anemic to a row and back without loss', () => {
    const mapper = new TwitchChannelMapper();
    const anemic = twitchChannelAnemic('channel-1', {
      updated_at: new Date('2026-10-26T21:00:00Z'),
    });

    expect(mapper.toAnemic(mapper.toRow(anemic))).toEqual(anemic);
  });
});

describe('TwitchTokenMapper', () => {
  const mapper = new TwitchTokenMapper(new TokenCipher(randomBytes(32)));

  it('stores both tokens encrypted and restores them', () => {
    const row = mapper.toRow(
      'channel-1' as TwitchChannelId,
      TOKEN,
      new Date('2026-10-26T21:00:00Z'),
    );

    expect(row.access_token).not.toBe(TOKEN.access_token);
    expect(row.refresh_token).not.toBe(TOKEN.refresh_token);
    expect(mapper.toToken(row)).toEqual(TOKEN);
  });

  it('keeps a missing refresh token missing', () => {
    const token = { ...TOKEN, refresh_token: null };
    const row = mapper.toRow(
      'channel-1' as TwitchChannelId,
      token,
      new Date('2026-10-26T21:00:00Z'),
    );

    expect(row.refresh_token).toBeNull();
    expect(mapper.toToken(row)).toEqual(token);
  });
});

describe('TwitchAccessTokenMapper', () => {
  it('maps to the twurple token and back without loss', () => {
    const mapper = new TwitchAccessTokenMapper();

    const accessToken = mapper.toAccessToken(TOKEN);

    expect(accessToken).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      scope: TOKEN.scopes,
      expiresIn: 14_400,
      obtainmentTimestamp: TOKEN.obtained_at.getTime(),
    });
    expect(mapper.toToken(accessToken)).toEqual(TOKEN);
  });
});
