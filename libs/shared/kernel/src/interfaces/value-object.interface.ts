export interface ValueObject<T> {
  get value(): T;
  equals(other: ValueObject<T>): boolean;
}
