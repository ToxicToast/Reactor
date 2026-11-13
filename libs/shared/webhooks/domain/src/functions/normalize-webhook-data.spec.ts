import { WEBHOOK_LIMITS } from '../constants/index.js';
import type { WebhookDataInput } from '../data/index.js';
import { normalizeWebhookData } from './normalize-webhook-data.function.js';

const VALID: WebhookDataInput = {
  url: 'https://hooks.example.com/twitch',
  events: ['twitch.stream.*'],
};

const eventKeys = (count: number): Array<string> => {
  return Array.from({ length: count }, (_, index) => `twitch.event${index}`);
};

describe('normalizeWebhookData', () => {
  it('trims, deduplicates and sorts the data', () => {
    const result = normalizeWebhookData({
      ...VALID,
      events: [' twitch.stream.* ', 'twitch.chat.message', 'twitch.stream.*'],
      description: '  Stream  ',
    });

    expect(result.value).toEqual({
      url: 'https://hooks.example.com/twitch',
      events: ['twitch.chat.message', 'twitch.stream.*'],
      description: 'Stream',
      format: 'json',
    });
  });

  it('turns an empty description into null', () => {
    const result = normalizeWebhookData({ ...VALID, description: '   ' });

    expect(result.value.description).toBeNull();
  });

  it('accepts data exactly at the limits', () => {
    const result = normalizeWebhookData({
      ...VALID,
      events: [
        ...eventKeys(WEBHOOK_LIMITS.EVENTS - 1),
        'x'.repeat(WEBHOOK_LIMITS.EVENT_KEY_LENGTH),
      ],
      description: 'x'.repeat(WEBHOOK_LIMITS.DESCRIPTION_LENGTH),
    });

    expect(result.isSuccess).toBe(true);
  });

  it.each<[string, Partial<WebhookDataInput>]>([
    ['an invalid url', { url: 'kaputt' }],
    ['a non-http url', { url: 'ftp://hooks.example.com' }],
    ['a url with credentials', { url: 'https://user:pw@hooks.example.com' }],
    ['no events', { events: [] }],
    ['too many events', { events: eventKeys(WEBHOOK_LIMITS.EVENTS + 1) }],
    [
      'a too long event key',
      { events: ['x'.repeat(WEBHOOK_LIMITS.EVENT_KEY_LENGTH + 1)] },
    ],
    ['an invalid event pattern', { events: ['Twitch Stream'] }],
    [
      'a too long description',
      { description: 'x'.repeat(WEBHOOK_LIMITS.DESCRIPTION_LENGTH + 1) },
    ],
    ['an unknown format', { format: 'xml' }],
  ])('refuses %s', (_case, override) => {
    const result = normalizeWebhookData({ ...VALID, ...override });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
