import type { Optional } from '@toxictoast/shared-types';
import {
  DomainError,
  onErrorValueError,
  onValueError,
} from '../errors/index.js';
import type { DomainEvent } from '../interfaces/index.js';

export class Result<T> {
  private constructor(
    readonly isSuccess: boolean,
    private readonly _value: Optional<T>,
    private readonly _error: Optional<DomainError>,
    readonly events: ReadonlyArray<DomainEvent>,
  ) {
    Object.freeze(this);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  get value(): T {
    if (!this.isSuccess) {
      throw new onErrorValueError();
    }
    return this._value as T;
  }

  get error(): DomainError {
    if (this.isSuccess) {
      throw new onValueError();
    }
    return this._error as DomainError;
  }

  static ok<T>(value?: T, events: DomainEvent[] = []): Result<T> {
    return new Result<T>(true, value, undefined, events);
  }

  static fail<T>(error: DomainError): Result<T> {
    return new Result<T>(false, undefined, error, []);
  }
}
