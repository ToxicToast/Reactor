import { isUuid } from '@toxictoast/shared-kernel';
import type { AuditableEvent } from '../interfaces/index.js';

const isBoundedString = (value: unknown, max: number): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
};

const isDateString = (value: unknown): value is string => {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
};

export const isAuditableEvent = (event: unknown): event is AuditableEvent => {
  if (typeof event !== 'object' || event === null) {
    return false;
  }
  const value = event as Record<string, unknown>;
  return (
    isUuid(value['event_id']) &&
    isBoundedString(value['event_namespace'], 100) &&
    isBoundedString(value['event_name'], 100) &&
    Number.isInteger(value['event_version']) &&
    isBoundedString(value['aggregate_id'], 64) &&
    isDateString(value['occurred_at']) &&
    typeof value['payload'] === 'object' &&
    value['payload'] !== null
  );
};
