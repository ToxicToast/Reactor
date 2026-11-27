import { Result } from '../classes/index.js';
import { ConflictError } from '../errors/index.js';
import { missingScopes } from '../functions/index.js';
import type {
  ConnectedAccountAnemic,
  ConnectedAccountEvents,
  ConnectedAccountMessages,
} from '../interfaces/index.js';
import type { Mutable } from '../types/index.js';
import { BaseDomain } from './base-domain.abstract.js';

/**
 * Verbinden, erneut verbinden, trennen und widerrufen eines Plattform-Kontos.
 * Die Plattform liefert nur ihre Events, Meldungen, die Normalisierung und
 * die Prüfung, ob eine neue Autorisierung zu demselben Konto gehört.
 */
export abstract class ConnectedAccountDomain<
  TAnemic extends ConnectedAccountAnemic,
  TData extends Pick<TAnemic, 'scopes'>,
  TPayload extends object,
> extends BaseDomain<TAnemic, TPayload> {
  protected abstract readonly events: ConnectedAccountEvents;
  protected abstract readonly messages: ConnectedAccountMessages;

  protected abstract normalize(data: TData): Result<TData>;
  protected abstract isSameAccount(data: TData): boolean;
  /** übernimmt die plattform-eigenen Felder; Scopes und connected setzt die Basis */
  protected abstract apply(data: TData): void;

  get isConnected(): boolean {
    return this.account.connected;
  }

  connect(): void {
    this.raise(this.events.CONNECTED);
  }

  reconnect(data: TData): Result<void> {
    const normalized = this.normalize(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    if (!this.isSameAccount(normalized.value)) {
      return Result.fail(new ConflictError(this.messages.FOREIGN_ACCOUNT));
    }

    this.apply(normalized.value);
    this.account.scopes = normalized.value.scopes;
    this.account.connected = true;
    this.touch();
    this.raise(this.events.CONNECTED);
    return Result.ok();
  }

  disconnect(): Result<void> {
    return this.markDisconnected(this.events.DISCONNECTED);
  }

  revoke(): Result<void> {
    return this.markDisconnected(this.events.REVOKED);
  }

  missingScopes(required: ReadonlyArray<string>): Array<string> {
    return missingScopes(this.account.scopes, required);
  }

  private markDisconnected(
    event: ConnectedAccountEvents[keyof ConnectedAccountEvents],
  ): Result<void> {
    if (!this.account.connected) {
      return Result.fail(new ConflictError(this.messages.NOT_CONNECTED));
    }

    this.account.connected = false;
    this.touch();
    this.raise(event);
    return Result.ok();
  }

  /** wie audit in BaseDomain: ein generischer State lässt sich sonst nicht beschreiben */
  private get account(): Mutable<ConnectedAccountAnemic> {
    return this.state as unknown as Mutable<ConnectedAccountAnemic>;
  }
}
