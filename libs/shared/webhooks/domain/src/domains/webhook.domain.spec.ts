import type { DomainContext } from '@toxictoast/shared-kernel';
import { WebhookFactory } from '../factories/index.js';
import type { WebhookDomain } from './webhook.domain.js';

let now = new Date('2026-10-28T10:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'webhook-1' as never },
  date: { now: () => now },
};

describe('WebhookDomain', () => {
  const factory = new WebhookFactory(ctx);

  const createWebhook = (): WebhookDomain => {
    const result = factory.createDomain({
      url: 'https://hooks.example.com/twitch',
      events: ['twitch.stream.*'],
      secret: 'whsec_1',
    });
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  };

  beforeEach(() => {
    now = new Date('2026-10-28T10:00:00Z');
  });

  describe('createDomain', () => {
    it('creates an active json webhook', () => {
      expect(createWebhook().toAnemic()).toEqual({
        id: 'webhook-1',
        url: 'https://hooks.example.com/twitch',
        events: ['twitch.stream.*'],
        description: null,
        active: true,
        format: 'json',
        secret: 'whsec_1',
        created_at: now,
        updated_at: null,
        deleted_at: null,
      });
    });

    it.each([[{ url: 'kaputt' }], [{ events: [] }], [{ secret: '' }]])(
      'refuses %p',
      (override) => {
        const result = factory.createDomain({
          url: 'https://hooks.example.com',
          events: ['*'],
          secret: 'whsec_1',
          ...override,
        });

        expect(result.isFailure).toBe(true);
        expect(result.error.code).toBe('VALIDATION');
      },
    );
  });

  describe('subscribesTo', () => {
    it('matches its event patterns while active', () => {
      const webhook = createWebhook();

      expect(webhook.subscribesTo('twitch.stream.online')).toBe(true);
      expect(webhook.subscribesTo('twitch.chat.message')).toBe(false);
    });

    it('ignores events once deactivated', () => {
      const webhook = createWebhook();
      webhook.update({
        url: 'https://hooks.example.com/twitch',
        events: ['twitch.stream.*'],
        active: false,
      });

      expect(webhook.subscribesTo('twitch.stream.online')).toBe(false);
    });
  });

  describe('update', () => {
    it('replaces the data and touches the webhook', () => {
      const webhook = createWebhook();
      now = new Date('2026-10-28T11:00:00Z');

      const result = webhook.update({
        url: 'https://hooks.example.com/neu',
        events: ['twitch.community.raid'],
        description: 'Raids',
        active: true,
      });

      expect(result.isSuccess).toBe(true);
      expect(webhook.toAnemic()).toMatchObject({
        url: 'https://hooks.example.com/neu',
        events: ['twitch.community.raid'],
        description: 'Raids',
        updated_at: now,
      });
    });

    it('refuses invalid data', () => {
      const result = createWebhook().update({
        url: 'kaputt',
        events: ['*'],
        active: true,
      });

      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('rotateSecret', () => {
    it('replaces the secret', () => {
      const webhook = createWebhook();

      webhook.rotateSecret('whsec_2');

      expect(webhook.toAnemic().secret).toBe('whsec_2');
    });
  });

  describe('delete', () => {
    it('deletes softly and deactivates', () => {
      const webhook = createWebhook();

      const result = webhook.delete();

      expect(result.isSuccess).toBe(true);
      expect(webhook.toAnemic()).toMatchObject({
        active: false,
        deleted_at: now,
      });
      expect(webhook.isActive).toBe(false);
    });

    it('refuses any change after deletion', () => {
      const webhook = createWebhook();
      webhook.delete();

      expect(webhook.delete().error.code).toBe('CONFLICT');
      expect(webhook.rotateSecret('whsec_2').error.code).toBe('CONFLICT');
      expect(
        webhook.update({
          url: 'https://hooks.example.com',
          events: ['*'],
          active: true,
        }).error.code,
      ).toBe('CONFLICT');
    });
  });
});
