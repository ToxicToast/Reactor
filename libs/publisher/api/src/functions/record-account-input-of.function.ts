import type { RecordAccountInput } from '@toxictoast/publisher-application';
import type { PayloadReader } from '@toxictoast/shared-kernel';
import { platformOf } from './platform-of.function.js';

/** liest den ganzen Umschlag; observed_at ist occurred_at */
export const recordAccountInputOf = (
  event: PayloadReader,
): RecordAccountInput => {
  const payload = event.record('payload');
  return {
    account: {
      platform: platformOf(payload),
      remote_id: payload.string('remote_id'),
      handle: payload.string('handle'),
      display_name: payload.nullableString('display_name'),
      url: payload.nullableString('url'),
    },
    metrics: {
      followers: payload.nullableNumber('followers'),
      media_count: payload.nullableNumber('media_count'),
    },
    observed_at: event.date('occurred_at'),
  };
};
