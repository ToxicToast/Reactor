import { webhookDeliveryAnemic } from '@toxictoast/shared-webhooks-application/testing';
import { DISCORD } from '../constants/index.js';
import { DiscordWebhookFormatter } from './discord-webhook-formatter.service.js';

describe('DiscordWebhookFormatter', () => {
  const embedOf = (formatter: DiscordWebhookFormatter, payload?: object) => {
    const delivery = webhookDeliveryAnemic(
      'delivery-1',
      payload ? { payload } : {},
    );
    const body = JSON.parse(formatter.render(delivery).body);
    return body.embeds[0];
  };

  it('uses the renderer of the event and adds the timestamp', () => {
    const formatter = new DiscordWebhookFormatter({
      'twitch.stream.online': () => ({ title: 'Live!', color: 1 }),
    });

    expect(embedOf(formatter)).toEqual({
      title: 'Live!',
      color: 1,
      timestamp: '2026-10-28T09:59:00.000Z',
    });
  });

  it('falls back to a generic embed for unknown events', () => {
    const embed = embedOf(new DiscordWebhookFormatter());

    expect(embed.title).toBe('twitch.stream.online');
    expect(embed.description).toContain('"channel_login": "toxictoast"');
  });

  it('falls back when a renderer fails', () => {
    const formatter = new DiscordWebhookFormatter({
      'twitch.stream.online': () => {
        throw new Error('broken payload');
      },
    });

    expect(embedOf(formatter).title).toBe('twitch.stream.online');
  });

  it('respects the discord limits', () => {
    const formatter = new DiscordWebhookFormatter({
      'twitch.stream.online': () => ({
        title: 'x'.repeat(300),
        fields: Array.from({ length: 30 }, () => ({ name: 'Feld', value: '' })),
      }),
    });

    const embed = embedOf(formatter);
    expect(embed.title).toHaveLength(DISCORD.LIMITS.TITLE);
    expect(embed.fields).toHaveLength(DISCORD.LIMITS.FIELDS);
    expect(embed.fields[0].value).toBe(DISCORD.EMPTY_VALUE);
  });
});
