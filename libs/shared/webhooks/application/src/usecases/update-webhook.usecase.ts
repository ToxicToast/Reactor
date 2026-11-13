import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  WebhookAnemic,
  WebhookDomain,
  WebhookFactory,
  WebhookId,
  WebhookRepository,
} from '@toxictoast/shared-webhooks-domain';
import type { UpdateWebhookInput } from '../data/index.js';
import { createWebhookEditor } from '../functions/index.js';

export class UpdateWebhookUseCase implements UseCase<
  UpdateWebhookInput,
  WebhookAnemic
> {
  private readonly editor: AggregateEditor<WebhookAnemic, WebhookDomain>;

  constructor(
    factory: WebhookFactory,
    repository: WebhookRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createWebhookEditor(factory, repository, persistence);
  }

  execute(input: UpdateWebhookInput): Promise<Result<WebhookAnemic>> {
    return this.editor.change(input.id as WebhookId, (webhook) => {
      return webhook.update(input);
    });
  }
}
