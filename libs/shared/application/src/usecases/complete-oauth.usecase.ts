import {
  DomainError,
  Result,
  ValidationError,
  type ConnectedAccountAnemic,
  type ConnectedAccountDomain,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { CompleteOAuthInput } from '../data/index.js';
import type {
  OAuthAuthorization,
  OAuthCodeExchange,
  OAuthTokenStore,
  SaveRepository,
  UseCase,
} from '../interfaces/index.js';
import type { DomainPersistence } from '../services/index.js';

/**
 * Code einlösen, Konto anlegen oder erneut verbinden, Scopes prüfen,
 * speichern und Token ablegen. Die Plattform liefert, wie aus ihrer Antwort
 * die Konto-Daten werden, wie ein bestehendes Konto gefunden wird und was
 * nach dem Verbinden passiert.
 */
export abstract class CompleteOAuthUseCase<
  TAnemic extends ConnectedAccountAnemic,
  TDomain extends ConnectedAccountDomain<TAnemic, TData, object>,
  TData extends Pick<TAnemic, 'scopes'>,
  TAuthorization extends OAuthAuthorization,
> implements UseCase<CompleteOAuthInput, TAnemic> {
  constructor(
    private readonly factory: Factory<TAnemic, TDomain, TData>,
    private readonly repository: SaveRepository<TAnemic>,
    private readonly persistence: DomainPersistence,
    private readonly auth: OAuthCodeExchange<TAuthorization>,
    private readonly tokens: OAuthTokenStore<TAnemic['id']>,
    private readonly requiredScopes: ReadonlyArray<string>,
  ) {}

  protected abstract dataOf(authorization: TAuthorization): TData;
  protected abstract findExisting(data: TData): Promise<Nullable<TAnemic>>;
  protected abstract afterConnect(account: TAnemic): Promise<void>;

  async execute(input: CompleteOAuthInput): Promise<Result<TAnemic>> {
    if (input.code.trim().length === 0) {
      return Result.fail(new ValidationError('Code must not be empty'));
    }

    const authorization = await this.exchange(input);
    if (authorization.isFailure) {
      return Result.fail(authorization.error);
    }

    const account = await this.load(this.dataOf(authorization.value));
    if (account.isFailure) {
      return Result.fail(account.error);
    }

    const missing = account.value.missingScopes(this.requiredScopes);
    if (missing.length > 0) {
      return Result.fail(
        new ValidationError(`Missing scopes: ${missing.join(', ')}`),
      );
    }

    const saved = await this.persistence.persist(
      account.value,
      this.repository,
    );
    if (saved.isFailure) {
      return Result.fail(saved.error);
    }

    await this.tokens.save(saved.value.id, authorization.value.token);
    await this.afterConnect(saved.value);
    return Result.ok(saved.value);
  }

  private async exchange(
    input: CompleteOAuthInput,
  ): Promise<Result<TAuthorization>> {
    try {
      return Result.ok(
        await this.auth.exchangeCode(input.code, input.redirect_uri),
      );
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }

  private async load(data: TData): Promise<Result<TDomain>> {
    const existing = await this.findExisting(data);
    if (!existing) {
      return this.factory.createDomain(data);
    }

    const account = this.factory.reconstitute(existing);
    const reconnected = account.reconnect(data);
    if (reconnected.isFailure) {
      return Result.fail(reconnected.error);
    }
    return Result.ok(account);
  }
}
