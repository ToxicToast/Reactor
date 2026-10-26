import type { DomainContext } from '@toxictoast/shared-kernel';
import type { TwitchChannelData } from '../data/index.js';
import { TwitchChannelFactory } from '../factories/index.js';
import type { TwitchChannelDomain } from './twitch-channel.domain.js';

let now = new Date('2026-10-26T20:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'channel-1' as never },
  date: { now: () => now },
};

const VALID: TwitchChannelData = {
  twitch_id: '123456',
  login: ' ToxicToast ',
  display_name: 'ToxicToast',
  scopes: ['user:read:chat', 'bits:read', 'user:read:chat'],
};

describe('TwitchChannelDomain', () => {
  const factory = new TwitchChannelFactory(ctx);

  const createChannel = (): TwitchChannelDomain => {
    const result = factory.createDomain(VALID);
    if (result.isFailure) {
      throw result.error;
    }
    result.value.toEvents();
    return result.value;
  };

  beforeEach(() => {
    now = new Date('2026-10-26T20:00:00Z');
  });

  describe('createDomain', () => {
    it('creates a connected channel with normalized data and a connected event', () => {
      const result = factory.createDomain(VALID);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic()).toMatchObject({
        twitch_id: '123456',
        login: 'toxictoast',
        scopes: ['bits:read', 'user:read:chat'],
        connected: true,
      });
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'channel_connected',
      ]);
    });

    it.each([
      [{ twitch_id: 'abc' }],
      [{ login: 'nicht erlaubt' }],
      [{ display_name: '   ' }],
    ])('refuses %p', (override) => {
      const result = factory.createDomain({ ...VALID, ...override });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('disconnect', () => {
    it('disconnects a connected channel and raises a disconnected event', () => {
      const channel = createChannel();
      now = new Date('2026-10-26T21:00:00Z');

      const result = channel.disconnect();

      expect(result.isSuccess).toBe(true);
      expect(channel.isConnected).toBe(false);
      expect(channel.toAnemic().updated_at).toEqual(now);
      expect(channel.toEvents().map((e) => e.event_name)).toEqual([
        'channel_disconnected',
      ]);
    });

    it('refuses to disconnect twice', () => {
      const channel = createChannel();
      channel.disconnect();
      channel.toEvents();

      const result = channel.disconnect();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
      expect(channel.toEvents()).toHaveLength(0);
    });
  });

  describe('reconnect', () => {
    it('takes over new profile data and scopes and connects again', () => {
      const channel = createChannel();
      channel.disconnect();
      channel.toEvents();

      const result = channel.reconnect({
        ...VALID,
        login: 'toxictoast_tv',
        display_name: 'ToxicToast_TV',
        scopes: ['moderator:read:chatters'],
      });

      expect(result.isSuccess).toBe(true);
      expect(channel.toAnemic()).toMatchObject({
        login: 'toxictoast_tv',
        display_name: 'ToxicToast_TV',
        scopes: ['moderator:read:chatters'],
        connected: true,
      });
      expect(channel.toEvents().map((e) => e.event_name)).toEqual([
        'channel_connected',
      ]);
    });

    it('refuses an authorization of a different twitch account', () => {
      const channel = createChannel();

      const result = channel.reconnect({ ...VALID, twitch_id: '999' });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
      expect(channel.toEvents()).toHaveLength(0);
    });

    it('refuses invalid data', () => {
      const channel = createChannel();

      const result = channel.reconnect({ ...VALID, login: '' });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('missingScopes', () => {
    it('lists required scopes that were not granted', () => {
      const channel = createChannel();

      expect(
        channel.missingScopes([
          'user:read:chat',
          'channel:read:polls',
          'bits:read',
        ]),
      ).toEqual(['channel:read:polls']);
    });
  });
});
