import type { OutboxRelayResult } from '../interfaces/index.js';

export const OUTBOX_RELAY_LOCK = 'outbox_relay';

export const EMPTY_OUTBOX_RELAY_RESULT: OutboxRelayResult = {
  published: 0,
  failed: 0,
  error: null,
};
