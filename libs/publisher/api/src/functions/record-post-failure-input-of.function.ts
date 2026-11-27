import type { RecordPostFailureInput } from '@toxictoast/publisher-application';
import type { PayloadReader } from '@toxictoast/shared-kernel';
import { platformOf } from './platform-of.function.js';

export const recordPostFailureInputOf = (
  event: PayloadReader,
): RecordPostFailureInput => {
  const payload = event.record('payload');
  return {
    post: {
      platform: platformOf(payload),
      remote_id: payload.string('remote_id'),
    },
    failed_at: event.date('occurred_at'),
    error: payload.string('error'),
  };
};
