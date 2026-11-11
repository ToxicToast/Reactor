import type { JsonValue } from './json-value.type.js';

export type Jsonified<T> = {
  [K in keyof T]: JsonValue<T[K]>;
};
