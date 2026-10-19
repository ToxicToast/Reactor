import type { Chainable } from './chainable.type.js';

declare const brand: unique symbol;

export type Brand<Type, B extends string> = Chainable<
  Type,
  { readonly [brand]: B }
>;
