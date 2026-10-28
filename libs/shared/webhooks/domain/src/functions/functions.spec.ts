import { matchesEventKey } from './matches-event-key.function.js';
import { normalizeWebhookData } from './normalize-webhook-data.function.js';

describe('matchesEventKey', () => {
  it.each([
    [['twitch.stream.online'], 'twitch.stream.online', true],
    [['twitch.stream.online'], 'twitch.stream.offline', false],
    [['twitch.community.*'], 'twitch.community.raid', true],
    [['twitch.community.*'], 'twitch.communityx.raid', false],
    [['*'], 'blog.post.published', true],
    [['twitch.chat.message', 'twitch.stream.*'], 'twitch.stream.offline', true],
  ])('%p matches %p: %p', (patterns, key, expected) => {
    expect(matchesEventKey(patterns, key)).toBe(expected);
  });
});

describe('normalizeWebhookData', () => {
  it('normalizes url, events and description', () => {
    const result = normalizeWebhookData({
      url: ' https://hooks.example.com/twitch ',
      events: [
        'twitch.stream.online',
        'twitch.community.*',
        'twitch.stream.online',
      ],
      description: '  Discord-Bridge  ',
    });

    expect(result.value).toEqual({
      url: 'https://hooks.example.com/twitch',
      events: ['twitch.community.*', 'twitch.stream.online'],
      description: 'Discord-Bridge',
    });
  });

  it('turns an empty description into null', () => {
    const result = normalizeWebhookData({
      url: 'http://n8n:5678/webhook/twitch',
      events: ['*'],
      description: '   ',
    });

    expect(result.value.description).toBeNull();
  });

  it.each([
    [{ url: 'kein-link' }],
    [{ url: 'ftp://hooks.example.com' }],
    [{ url: 'https://user:pass@hooks.example.com' }],
    [{ events: [] }],
    [{ events: ['Twitch.Stream'] }],
    [{ events: ['twitch.*.online'] }],
    [{ description: 'x'.repeat(201) }],
  ])('refuses %p', (override) => {
    const result = normalizeWebhookData({
      url: 'https://hooks.example.com',
      events: ['twitch.stream.online'],
      ...override,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
