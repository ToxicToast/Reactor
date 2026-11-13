import type { Optional } from '@toxictoast/shared-types';
import {
  DomainError,
  ErrorOfSuccessfulResultError,
  ValueOfFailedResultError,
} from '../errors/index.js';

export class Result<T> {
  private constructor(
    readonly isSuccess: boolean,
    private readonly _value: Optional<T>,
    private readonly _error: Optional<DomainError>,
  ) {
    Object.freeze(this);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  get value(): T {
    if (!this.isSuccess) {
      throw new ValueOfFailedResultError();
    }
    return this._value as T;
  }

  get error(): DomainError {
    if (this.isSuccess) {
      throw new ErrorOfSuccessfulResultError();
    }
    return this._error as DomainError;
  }

  static ok<T>(value?: T): Result<T> {
    return new Result<T>(true, value, undefined);
  }

  static fail<T>(error: DomainError): Result<T> {
    return new Result<T>(false, undefined, error);
  }
}
