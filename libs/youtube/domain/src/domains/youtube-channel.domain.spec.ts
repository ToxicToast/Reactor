import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import type { YouTubeChannelData } from '../data/index.js';
import { YouTubeChannelFactory } from '../factories/index.js';
import type { YouTubeChannelDomain } from './youtube-channel.domain.js';

let now = new Date('2026-11-27T12:00:00Z');

const ctx = createFixedTestContext('channel-1', () => now);

const VALID: YouTubeChannelData = {
  youtube_id: 'UCabcdefghijklmnopqrstuv',
  handle: ' @ToxicToastTTV ',
  title: ' ToxicToast ',
  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.readonly',
  ],
};

const READ_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

describe('YouTubeChannelDomain', () => {
  const factory = new YouTubeChannelFactory(ctx);

  const createChannel = (): YouTubeChannelDomain => {
    const result = factory.createDomain(VALID);
    if (result.isFailure) {
      throw result.error;
    }
    result.value.toEvents();
    return result.value;
  };

  beforeEach(() => {
    now = new Date('2026-11-27T12:00:00Z');
  });

  it('creates a connected channel with normalized data and a connected event', () => {
    const result = factory.createDomain(VALID);

    expect(result.isSuccess).toBe(true);
    expect(result.value.toAnemic()).toMatchObject({
      youtube_id: 'UCabcdefghijklmnopqrstuv',
      handle: '@ToxicToastTTV',
      title: 'ToxicToast',
      scopes: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
      ],
      connected: true,
    });
    expect(result.value.toEvents().map((event) => event.event_name)).toEqual([
      'connected',
    ]);
  });

  it.each([[{ youtube_id: 'abc' }], [{ title: '   ' }]])(
    'refuses %p',
    (override) => {
      const result = factory.createDomain({ ...VALID, ...override });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    },
  );

  it('stores channels without a handle as null', () => {
    const result = factory.createDomain({ ...VALID, handle: null });

    expect(result.value.toAnemic().handle).toBeNull();
  });

  it('refuses to reconnect with another channel', () => {
    const channel = createChannel();

    const result = channel.reconnect({
      ...VALID,
      youtube_id: 'UCzzzzzzzzzzzzzzzzzzzzzz',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('reconnects with new scopes after a revoke', () => {
    const channel = createChannel();
    channel.revoke();
    channel.toEvents();
    now = new Date('2026-11-27T13:00:00Z');

    const result = channel.reconnect({
      ...VALID,
      scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    });

    expect(result.isSuccess).toBe(true);
    expect(channel.isConnected).toBe(true);
    expect(channel.missingScopes(READ_SCOPES)).toEqual(READ_SCOPES);
    expect(channel.toAnemic().updated_at).toEqual(now);
    expect(channel.toEvents().map((event) => event.event_name)).toEqual([
      'connected',
    ]);
  });

  it('refuses to disconnect twice', () => {
    const channel = createChannel();
    channel.disconnect();
    channel.toEvents();

    const result = channel.disconnect();

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });
});
