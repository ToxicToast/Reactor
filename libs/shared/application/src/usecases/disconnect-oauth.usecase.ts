import {
  Result,
  type ConnectedAccountAnemic,
  type ConnectedAccountDomain,
  type Repository,
} from '@toxictoast/shared-kernel';
import type { DisconnectAccountInput } from '../data/index.js';
import type {
  AggregateFactory,
  OAuthTokenStore,
  UseCase,
} from '../interfaces/index.js';
import { AggregateEditor, type DomainPersistence } from '../services/index.js';

/** trennen, die Plattform aufräumen lassen, Token löschen */
export abstract class DisconnectOAuthUseCase<
  TAnemic extends ConnectedAccountAnemic,
  TDomain extends ConnectedAccountDomain<
    TAnemic,
    Pick<TAnemic, 'scopes'>,
    object
  >,
> implements UseCase<DisconnectAccountInput<TAnemic['id']>, TAnemic> {
  private readonly editor: AggregateEditor<TAnemic, TDomain>;

  constructor(
    name: string,
    factory: AggregateFactory<TAnemic, TDomain>,
    repository: Repository<TAnemic>,
    persistence: DomainPersistence,
    private readonly tokens: OAuthTokenStore<TAnemic['id']>,
  ) {
    this.editor = new AggregateEditor<TAnemic, TDomain>(
      name,
      factory,
      repository,
      persistence,
    );
  }

  /** z. B. Abos bei der Plattform beenden; läuft vor dem Löschen des Tokens */
  protected abstract beforeTokenRemoval(account: TAnemic): Promise<void>;

  async execute(
    input: DisconnectAccountInput<TAnemic['id']>,
  ): Promise<Result<TAnemic>> {
    const saved = await this.editor.change(input.id, (account) => {
      return account.disconnect();
    });
    if (saved.isFailure) {
      return saved;
    }

    await this.beforeTokenRemoval(saved.value);
    await this.tokens.remove(saved.value.id);
    return Result.ok(saved.value);
  }
}
