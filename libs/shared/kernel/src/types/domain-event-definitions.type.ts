import type { DomainEventDefinition } from '../interfaces/index.js';

export type DomainEventDefinitions<
  TNamespace extends string,
  TNames extends Record<string, string>,
> = {
  readonly [K in keyof TNames]: DomainEventDefinition<TNames[K], TNamespace>;
};
