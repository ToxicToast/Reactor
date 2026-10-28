import type { Result, Clock } from '@toxictoast/shared-kernel';
import type { AdvisoryLock } from '@toxictoast/shared-persistence';
import {
  IDLE_POLLING_RESULT,
  errorMessage,
  type PollingResult,
  type PollingTask,
} from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { WebhookFormatter } from '@toxictoast/shared-webhooks-application';
import {
  isWebhookActive,
  type WebhookAnemic,
  type WebhookDeliveryAnemic,
  type WebhookDeliveryDomain,
  type WebhookDeliveryFactory,
  type WebhookDeliveryRepository,
  type WebhookRepository,
  type WebhookRetryPolicy,
} from '@toxictoast/shared-webhooks-domain';
import { WEBHOOK_ABANDON_REASONS, WEBHOOK_RELAY } from '../constants/index.js';
import { buildWebhookRequest, isSuccessfulStatus } from '../functions/index.js';
import type { WebhookSender } from '../interfaces/index.js';

export class WebhookRelay implements PollingTask {
  private readonly formatters: ReadonlyMap<string, WebhookFormatter>;

  constructor(
    private readonly lock: AdvisoryLock,
    private readonly webhooks: WebhookRepository,
    private readonly deliveries: WebhookDeliveryRepository,
    private readonly factory: WebhookDeliveryFactory,
    formatters: ReadonlyArray<WebhookFormatter>,
    private readonly sender: WebhookSender,
    private readonly policy: WebhookRetryPolicy,
    private readonly clock: Clock,
    readonly batchSize: number = WEBHOOK_RELAY.BATCH_SIZE,
  ) {
    this.formatters = new Map(
      formatters.map((formatter) => [formatter.name, formatter]),
    );
  }

  run(): Promise<PollingResult> {
    return this.lock.runExclusive(
      WEBHOOK_RELAY.LOCK,
      () => this.relayBatch(),
      IDLE_POLLING_RESULT,
    );
  }

  private async relayBatch(): Promise<PollingResult> {
    const due = await this.deliveries.findDue(this.clock.now(), this.batchSize);
    await Promise.all(due.map((delivery) => this.deliver(delivery)));
    return { processed: due.length, error: null };
  }

  private async deliver(anemic: WebhookDeliveryAnemic): Promise<void> {
    const delivery = this.factory.reconstitute(anemic);
    const webhook = await this.webhooks.findById(anemic.webhook_id, true);
    await this.attempt(delivery, webhook);
    await this.deliveries.save(this.factory.constitute(delivery));
  }

  private async attempt(
    delivery: WebhookDeliveryDomain,
    webhook: Nullable<WebhookAnemic>,
  ): Promise<Result<void>> {
    if (!webhook || !isWebhookActive(webhook)) {
      return delivery.abandon(WEBHOOK_ABANDON_REASONS.INACTIVE);
    }
    const formatter = this.formatters.get(webhook.format);
    if (!formatter) {
      return delivery.abandon(
        `${WEBHOOK_ABANDON_REASONS.UNKNOWN_FORMAT} ${webhook.format}`,
      );
    }

    const anemic = delivery.toAnemic();
    const request = buildWebhookRequest(
      webhook,
      anemic,
      formatter.render(anemic),
      this.clock.now(),
    );
    try {
      const response = await this.sender.send(request);
      if (isSuccessfulStatus(response.status_code)) {
        return delivery.delivered(response.status_code);
      }
      return delivery.attemptFailed(
        {
          status_code: response.status_code,
          error: `HTTP ${response.status_code}`,
        },
        this.policy,
      );
    } catch (error: unknown) {
      return delivery.attemptFailed(
        { status_code: null, error: errorMessage(error) },
        this.policy,
      );
    }
  }
}
