import { TwitchWebhookDeliveryStatus } from '@toxictoast/contracts-grpc';
import { webhookDeliveryView } from './webhook-delivery-view.function.js';

describe('webhookDeliveryView', () => {
  it('names the delivery status', () => {
    const view = webhookDeliveryView({
      id: 'delivery-1',
      webhook_id: 'webhook-1',
      event_key: 'twitch.stream.online',
      event_id: 'event-1',
      status: TwitchWebhookDeliveryStatus.TWITCH_WEBHOOK_DELIVERY_STATUS_FAILED,
      attempts: 8,
      created_at: '2026-10-28T20:00:00.000Z',
    });

    expect(view.status).toBe('failed');
    expect(view.attempts).toBe(8);
  });
});
