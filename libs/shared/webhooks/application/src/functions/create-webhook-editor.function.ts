import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  WebhookAnemic,
  WebhookDomain,
  WebhookFactory,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';

export const createWebhookEditor = (
  factory: WebhookFactory,
  repository: WebhookRepository,
  persistence: DomainPersistence,
): AggregateEditor<WebhookAnemic, WebhookDomain> => {
  return new AggregateEditor<WebhookAnemic, WebhookDomain>(
    'Webhook',
    factory,
    repository,
    persistence,
  );
};
