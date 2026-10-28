import { createHmac } from 'node:crypto';
import {
  webhookAnemic,
  webhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-application';
import { buildWebhookRequest } from './build-webhook-request.function.js';
import { isSuccessfulStatus } from './is-successful-status.function.js';
import { signWebhook } from './sign-webhook.function.js';

describe('signWebhook', () => {
  it('signs timestamp and body with hmac sha256', () => {
    const expected = createHmac('sha256', 'whsec_1')
      .update('1793180000.{"a":1}')
      .digest('hex');

    expect(signWebhook('whsec_1', 1793180000, '{"a":1}')).toBe(
      `sha256=${expected}`,
    );
  });

  it('changes with the timestamp', () => {
    expect(signWebhook('whsec_1', 1, 'body')).not.toBe(
      signWebhook('whsec_1', 2, 'body'),
    );
  });
});

describe('isSuccessfulStatus', () => {
  it.each([
    [200, true],
    [204, true],
    [299, true],
    [301, false],
    [404, false],
    [500, false],
  ])('%p is successful: %p', (status, expected) => {
    expect(isSuccessfulStatus(status)).toBe(expected);
  });
});

describe('buildWebhookRequest', () => {
  it('builds a signed post with event and delivery headers', () => {
    const webhook = webhookAnemic('webhook-1', { secret: 'whsec_1' });
    const delivery = webhookDeliveryAnemic('delivery-1');
    const now = new Date('2026-10-28T10:00:00Z');

    const request = buildWebhookRequest(
      webhook,
      delivery,
      { content_type: 'application/json', body: '{"a":1}' },
      now,
    );

    expect(request).toEqual({
      url: 'https://hooks.example.com/twitch',
      body: '{"a":1}',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Azkaban-Webhooks/1',
        'X-Azkaban-Event': 'twitch.stream.online',
        'X-Azkaban-Delivery': 'delivery-1',
        'X-Azkaban-Timestamp': '1793181600',
        'X-Azkaban-Signature': signWebhook('whsec_1', 1793181600, '{"a":1}'),
      },
    });
  });
});
