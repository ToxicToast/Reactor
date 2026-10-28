import { randomBytes } from 'node:crypto';
import { SecretCipher } from '@toxictoast/shared-system';
import {
  webhookAnemic,
  webhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-application';
import { WebhookMapper } from '../mappers/index.js';
import { JsonWebhookFormatter } from './json-webhook-formatter.service.js';
import { RandomWebhookSecretGenerator } from './random-webhook-secret-generator.service.js';

describe('RandomWebhookSecretGenerator', () => {
  it('creates distinct prefixed secrets', () => {
    const generator = new RandomWebhookSecretGenerator();

    const first = generator.generate();
    const second = generator.generate();

    expect(first).toMatch(/^whsec_[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
  });
});

describe('JsonWebhookFormatter', () => {
  it('renders the event as json', () => {
    const formatted = new JsonWebhookFormatter().render(
      webhookDeliveryAnemic('delivery-1'),
    );

    expect(formatted.content_type).toBe('application/json');
    expect(JSON.parse(formatted.body)).toEqual({
      id: 'event-1',
      event: 'twitch.stream.online',
      occurred_at: '2026-10-28T09:59:00.000Z',
      data: { channel_login: 'toxictoast' },
    });
  });
});

describe('WebhookMapper', () => {
  it('encrypts the secret and maps back without loss', () => {
    const mapper = new WebhookMapper(new SecretCipher(randomBytes(32)));
    const webhook = webhookAnemic('webhook-1', { secret: 'whsec_1' });

    const row = mapper.toRow(webhook);

    expect(row.secret).not.toBe('whsec_1');
    expect(mapper.toAnemic(row)).toEqual(webhook);
  });
});
