import { eventKey } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import type { IncomingTwitchEvent } from '../interfaces/index.js';

export const mapperFor = <T>(
  mappers: Readonly<Record<string, T>>,
  event: IncomingTwitchEvent,
): Optional<T> => {
  return mappers[eventKey(event.event_namespace, event.event_name)];
};
