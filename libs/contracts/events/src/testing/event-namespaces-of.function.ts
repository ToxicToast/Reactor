import type { EventDefinitionLike } from './event-definition-like.interface.js';

export const eventNamespacesOf = (
  definitions: Readonly<Record<string, EventDefinitionLike>>,
): Array<string> => {
  return [...new Set(Object.values(definitions).map((item) => item.namespace))];
};
