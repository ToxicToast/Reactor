import type { Nullable } from '@toxictoast/shared-types';
import { InvalidPayloadError } from '../errors/invalid-payload.error.js';
import { isUuid } from '../functions/is-uuid.function.js';
import { parseIsoDate } from '../functions/parse-iso-date.function.js';

type PayloadRecord = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is PayloadRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const isInteger = (value: unknown): value is number => {
  return Number.isInteger(value);
};

const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

const isList = (value: unknown): value is ReadonlyArray<unknown> => {
  return Array.isArray(value);
};

export class PayloadReader {
  private readonly values: PayloadRecord;

  constructor(payload: unknown) {
    if (!isRecord(payload)) {
      throw new InvalidPayloadError('payload must be an object');
    }
    this.values = payload;
  }

  get object(): object {
    return this.values;
  }

  has(key: string): boolean {
    return this.values[key] !== undefined && this.values[key] !== null;
  }

  /** Der ungeprüfte Rohwert – nur für eigene Guards wie isActorIdentity. */
  value(key: string): unknown {
    return this.values[key];
  }

  string(key: string): string {
    return this.read(key, isString, 'a string');
  }

  nullableString(key: string): Nullable<string> {
    return this.has(key) ? this.string(key) : null;
  }

  boundedString(key: string, maxLength: number): string {
    const value = this.string(key);
    if (value.length === 0 || value.length > maxLength) {
      throw new InvalidPayloadError(
        `${key} must have between 1 and ${maxLength} characters`,
      );
    }
    return value;
  }

  oneOf<T extends string>(key: string, values: ReadonlyArray<T>): T {
    const value = this.string(key);
    if (!(values as ReadonlyArray<string>).includes(value)) {
      throw new InvalidPayloadError(
        `${key} must be one of ${values.join(', ')}`,
      );
    }
    return value as T;
  }

  /** Immer kleingeschrieben, damit IDs überall gleich aussehen. */
  uuid(key: string): string {
    return this.read(key, isUuid, 'a uuid').toLowerCase();
  }

  number(key: string): number {
    return this.read(key, isNumber, 'a number');
  }

  integer(key: string): number {
    return this.read(key, isInteger, 'an integer');
  }

  boolean(key: string): boolean {
    return this.read(key, isBoolean, 'a boolean');
  }

  date(key: string): Date {
    return parseIsoDate(this.string(key), key);
  }

  nullableDate(key: string): Nullable<Date> {
    return this.has(key) ? this.date(key) : null;
  }

  record(key: string): PayloadReader {
    return new PayloadReader(this.read(key, isRecord, 'an object'));
  }

  list(key: string): Array<PayloadReader> {
    return this.read(key, isList, 'a list').map((item) => {
      return new PayloadReader(item);
    });
  }

  stringList(key: string): Array<string> {
    return this.read(key, isList, 'a list').map((item, index) => {
      if (!isString(item)) {
        throw new InvalidPayloadError(`${key}[${index}] must be a string`);
      }
      return item;
    });
  }

  private read<T>(
    key: string,
    guard: (value: unknown) => value is T,
    expected: string,
  ): T {
    const value = this.values[key];
    if (!guard(value)) {
      throw new InvalidPayloadError(`${key} must be ${expected}`);
    }
    return value;
  }
}
