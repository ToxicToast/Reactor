import type { EventDefinitionLike } from './event-definition-like.interface.js';

export const eventNamesOf = (
  definitions: Readonly<Record<string, EventDefinitionLike>>,
): Array<string> => {
  return Object.values(definitions)
    .map((definition) => definition.name)
    .sort();
};
