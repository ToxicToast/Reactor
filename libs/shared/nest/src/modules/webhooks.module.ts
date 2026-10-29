import { Logger, Module, type DynamicModule } from '@nestjs/common';
import type { Clock } from '@toxictoast/shared-kernel';
import {
  AdvisoryLock,
  TransactionContext,
} from '@toxictoast/shared-persistence';
import {
  describeError,
  numberEnv,
  PollingWorker,
  SecretCipher,
  secretKeyEnv,
} from '@toxictoast/shared-system';
import {
  CreateWebhookUseCase,
  DeleteWebhookUseCase,
  DispatchWebhookEventUseCase,
  ListWebhookDeliveriesUseCase,
  ListWebhooksUseCase,
  RotateWebhookSecretUseCase,
  UpdateWebhookUseCase,
} from '@toxictoast/shared-webhooks-application';
import {
  WebhookDeliveryFactory,
  WebhookFactory,
  WebhookRetryPolicy,
  type WebhookDeliveryRepository,
  type WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import {
  FetchWebhookSender,
  JsonWebhookFormatter,
  RandomWebhookSecretGenerator,
  TypeOrmWebhookDeliveryRepository,
  TypeOrmWebhookRepository,
  WebhookRelay,
} from '@toxictoast/shared-webhooks-infrastructure';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import { provideClass } from '../functions/index.js';
import type { WebhooksModuleOptions } from '../interfaces/index.js';
import { PollingWorkerLifecycle } from '../lifecycles/index.js';

const { CLOCK, DOMAIN_CONTEXT } = TOKENS;
const { WEBHOOK_REPOSITORY, WEBHOOK_DELIVERY_REPOSITORY } = TOKENS;
const { WEBHOOK_SECRET_CIPHER, WEBHOOK_SECRET_GENERATOR } = TOKENS;
const { WEBHOOK_RELAY_WORKER } = TOKENS;
const DATABASE = [DataSource, TransactionContext];

const USE_CASES = [
  CreateWebhookUseCase,
  ListWebhooksUseCase,
  UpdateWebhookUseCase,
  DeleteWebhookUseCase,
  RotateWebhookSecretUseCase,
  ListWebhookDeliveriesUseCase,
  DispatchWebhookEventUseCase,
];

@Module({})
export class WebhooksModule {
  static forRoot(options: WebhooksModuleOptions): DynamicModule {
    const logger = new Logger('Webhooks');
    const formatters = options.formatters ?? [new JsonWebhookFormatter()];

    return {
      module: WebhooksModule,
      global: true,
      providers: [
        // ── Secrets ─────────────────────────────────
        {
          provide: WEBHOOK_SECRET_CIPHER,
          useFactory: () =>
            new SecretCipher(secretKeyEnv(options.secretKeyEnv)),
        },
        provideClass(
          RandomWebhookSecretGenerator,
          [],
          WEBHOOK_SECRET_GENERATOR,
        ),

        // ── Domain ──────────────────────────────────
        provideClass(WebhookFactory, [DOMAIN_CONTEXT]),
        provideClass(WebhookDeliveryFactory, [DOMAIN_CONTEXT]),
        provideClass(WebhookRetryPolicy),

        // ── Infrastructure ──────────────────────────
        provideClass(
          TypeOrmWebhookRepository,
          [...DATABASE, WEBHOOK_SECRET_CIPHER],
          WEBHOOK_REPOSITORY,
        ),
        provideClass(
          TypeOrmWebhookDeliveryRepository,
          DATABASE,
          WEBHOOK_DELIVERY_REPOSITORY,
        ),

        // ── Use Cases ───────────────────────────────
        provideClass(CreateWebhookUseCase, [
          WebhookFactory,
          WEBHOOK_REPOSITORY,
          WEBHOOK_SECRET_GENERATOR,
        ]),
        provideClass(ListWebhooksUseCase, [WEBHOOK_REPOSITORY]),
        provideClass(UpdateWebhookUseCase, [
          WebhookFactory,
          WEBHOOK_REPOSITORY,
        ]),
        provideClass(DeleteWebhookUseCase, [
          WebhookFactory,
          WEBHOOK_REPOSITORY,
        ]),
        provideClass(RotateWebhookSecretUseCase, [
          WebhookFactory,
          WEBHOOK_REPOSITORY,
          WEBHOOK_SECRET_GENERATOR,
        ]),
        provideClass(ListWebhookDeliveriesUseCase, [
          WEBHOOK_REPOSITORY,
          WEBHOOK_DELIVERY_REPOSITORY,
        ]),
        provideClass(DispatchWebhookEventUseCase, [
          WebhookDeliveryFactory,
          WEBHOOK_REPOSITORY,
          WEBHOOK_DELIVERY_REPOSITORY,
        ]),

        // ── Relay ───────────────────────────────────
        {
          provide: WEBHOOK_RELAY_WORKER,
          inject: [
            DataSource,
            WEBHOOK_REPOSITORY,
            WEBHOOK_DELIVERY_REPOSITORY,
            WebhookDeliveryFactory,
            WebhookRetryPolicy,
            CLOCK,
          ],
          useFactory: (
            dataSource: DataSource,
            webhooks: WebhookRepository,
            deliveries: WebhookDeliveryRepository,
            factory: WebhookDeliveryFactory,
            policy: WebhookRetryPolicy,
            clock: Clock,
          ) => {
            const relay = new WebhookRelay(
              new AdvisoryLock(dataSource),
              webhooks,
              deliveries,
              factory,
              formatters,
              new FetchWebhookSender(),
              policy,
              clock,
            );
            return new PollingWorker(relay, {
              intervalMs: numberEnv('WEBHOOK_INTERVAL_MS', 1000),
              onError: (error) => {
                logger.error('Webhook relay failed', describeError(error));
              },
            });
          },
        },
        provideClass(PollingWorkerLifecycle, [WEBHOOK_RELAY_WORKER]),
      ],
      exports: [WEBHOOK_REPOSITORY, WEBHOOK_DELIVERY_REPOSITORY, ...USE_CASES],
    };
  }
}
