import type { DomainEventDefinition } from '../interfaces/index.js';
import type { DomainEventDefinitions } from '../types/index.js';

export const defineDomainEvents = <
  const TNamespace extends string,
  const TNames extends Record<string, string>,
>(
  namespace: TNamespace,
  version: number,
  names: TNames,
): DomainEventDefinitions<TNamespace, TNames> => {
  const definitions: Record<string, DomainEventDefinition> = {};
  for (const [key, name] of Object.entries(names)) {
    definitions[key] = Object.freeze({ namespace, name, version });
  }
  return Object.freeze(definitions) as DomainEventDefinitions<
    TNamespace,
    TNames
  >;
};
