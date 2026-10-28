import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookDomain,
  WebhookFactory,
  WebhookId,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';

export const changeWebhook = async (
  factory: WebhookFactory,
  repository: WebhookRepository,
  id: string,
  change: (webhook: WebhookDomain) => Result<void>,
): Promise<Result<WebhookAnemic>> => {
  const anemic = await repository.findById(id as WebhookId);
  if (!anemic) {
    return Result.fail(new NotFoundError('Webhook', id));
  }

  const webhook = factory.reconstitute(anemic);
  const changed = change(webhook);
  if (changed.isFailure) {
    return Result.fail(changed.error);
  }

  return Result.ok(await repository.save(factory.constitute(webhook)));
};
