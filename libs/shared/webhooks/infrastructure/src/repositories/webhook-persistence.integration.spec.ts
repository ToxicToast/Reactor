import { randomBytes } from 'node:crypto';
import { AdvisoryLock } from '@toxictoast/shared-persistence';
import { SecretCipher } from '@toxictoast/shared-system';
import {
  webhookAnemic,
  webhookDeliveryAnemic,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookDeliveryFactory,
  WebhookRetryPolicy,
  type WebhookId,
} from '@toxictoast/shared-webhooks-domain';
import { JsonWebhookFormatter, WebhookRelay } from '../services/index.js';
import {
  RecordingWebhookSender,
  WebhookTestDatabase,
} from '../testing/index.js';
import { TypeOrmWebhookDeliveryRepository } from './typeorm-webhook-delivery.repository.js';
import { TypeOrmWebhookRepository } from './typeorm-webhook.repository.js';

const WEBHOOK_ID = '0192f3a0-0000-7000-8000-0000000000a1';
const OTHER_ID = '0192f3a0-0000-7000-8000-0000000000a2';
const delivery = (id: number) => {
  return `0192f3a0-0000-7000-8000-0000000000d${id}`;
};
const NOW = new Date('2026-10-28T10:00:00Z');
const clock = { now: () => NOW };

describe('webhook persistence', () => {
  const database = new WebhookTestDatabase();
  let webhooks: TypeOrmWebhookRepository;
  let deliveries: TypeOrmWebhookDeliveryRepository;

  beforeAll(async () => {
    await database.start();
    webhooks = new TypeOrmWebhookRepository(
      database.dataSource,
      database.context,
      new SecretCipher(randomBytes(32)),
    );
    deliveries = new TypeOrmWebhookDeliveryRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  describe('webhooks', () => {
    it('stores the secret encrypted and reads it back', async () => {
      await webhooks.save(webhookAnemic(WEBHOOK_ID, { secret: 'whsec_1' }));

      const [row] = await database.dataSource.query(
        'SELECT secret FROM webhooks',
      );
      expect(row.secret).not.toBe('whsec_1');
      expect((await webhooks.findById(WEBHOOK_ID as WebhookId))?.secret).toBe(
        'whsec_1',
      );
    });

    it('finds active webhooks whose patterns match the event', async () => {
      await webhooks.save(
        webhookAnemic(WEBHOOK_ID, { events: ['twitch.stream.*'] }),
      );
      await webhooks.save(
        webhookAnemic(OTHER_ID, { events: ['twitch.stream.*'], active: false }),
      );

      const found = await webhooks.findActiveForEvent('twitch.stream.online');

      expect(found.map((webhook) => webhook.id)).toEqual([WEBHOOK_ID]);
    });
  });

  describe('deliveries', () => {
    beforeEach(() => webhooks.save(webhookAnemic(WEBHOOK_ID)));

    it('ignores a second delivery of the same event', async () => {
      await deliveries.enqueue([
        webhookDeliveryAnemic(delivery(1), {
          webhook_id: WEBHOOK_ID as WebhookId,
        }),
      ]);
      await deliveries.enqueue([
        webhookDeliveryAnemic(delivery(2), {
          webhook_id: WEBHOOK_ID as WebhookId,
        }),
      ]);

      expect(
        await deliveries.findByWebhook(WEBHOOK_ID as WebhookId),
      ).toHaveLength(1);
    });

    it('finds due deliveries, oldest first', async () => {
      await deliveries.enqueue([
        webhookDeliveryAnemic(delivery(1), {
          webhook_id: WEBHOOK_ID as WebhookId,
          event_id: 'event-1',
          next_attempt_at: new Date('2026-10-28T09:59:00Z'),
        }),
        webhookDeliveryAnemic(delivery(2), {
          webhook_id: WEBHOOK_ID as WebhookId,
          event_id: 'event-2',
          next_attempt_at: new Date('2026-10-28T09:58:00Z'),
        }),
        webhookDeliveryAnemic(delivery(3), {
          webhook_id: WEBHOOK_ID as WebhookId,
          event_id: 'event-3',
          next_attempt_at: new Date('2026-10-28T10:01:00Z'),
        }),
        webhookDeliveryAnemic(delivery(4), {
          webhook_id: WEBHOOK_ID as WebhookId,
          event_id: 'event-4',
          status: 'delivered',
        }),
      ]);

      const due = await deliveries.findDue(NOW, 10);

      expect(due.map((item) => item.id)).toEqual([delivery(2), delivery(1)]);
    });
  });

  describe('relay', () => {
    it('delivers and stores the result under the advisory lock', async () => {
      await webhooks.save(webhookAnemic(WEBHOOK_ID));
      await deliveries.enqueue([
        webhookDeliveryAnemic(delivery(1), {
          webhook_id: WEBHOOK_ID as WebhookId,
        }),
      ]);
      const sender = new RecordingWebhookSender();
      const relay = new WebhookRelay(
        new AdvisoryLock(database.dataSource, database.context),
        webhooks,
        deliveries,
        new WebhookDeliveryFactory({
          id: { generate: () => delivery(9) as never },
          date: clock,
        }),
        [new JsonWebhookFormatter()],
        sender,
        new WebhookRetryPolicy(),
        clock,
      );

      const result = await relay.run();

      expect(result.processed).toBe(1);
      expect(sender.requests).toHaveLength(1);
      expect(
        await deliveries.findByWebhook(WEBHOOK_ID as WebhookId, 'delivered'),
      ).toHaveLength(1);
    });
  });
});
