export type JsonValue<T> = T extends Date
  ? string
  : T extends string
    ? Record<never, never> extends Omit<T, keyof string>
      ? `${T}`
      : string
    : T extends ReadonlyArray<infer TItem>
      ? ReadonlyArray<JsonValue<TItem>>
      : T;
