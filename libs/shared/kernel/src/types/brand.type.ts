import type { Chainable } from '@toxictoast/shared-types';

declare const brand: unique symbol;

export type Brand<Type, B extends string> = Chainable<
  Type,
  { readonly [brand]: B }
>;
