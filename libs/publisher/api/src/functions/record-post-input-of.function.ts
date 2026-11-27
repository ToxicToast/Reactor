import type { RecordPostInput } from '@toxictoast/publisher-application';
import { POST_LIMITS, PostOrigins } from '@toxictoast/publisher-domain';
import { truncateText, type PayloadReader } from '@toxictoast/shared-kernel';
import { platformOf } from './platform-of.function.js';
import { postMetricsOf } from './post-metrics-of.function.js';

/** importiert ist der Normalfall; einen vom Publisher veröffentlichten Post lässt das Repository unberührt */
export const recordPostInputOf = (event: PayloadReader): RecordPostInput => {
  const payload = event.record('payload');
  const title = payload.nullableString('title');
  return {
    post: {
      platform: platformOf(payload),
      remote_id: payload.string('remote_id'),
      account_remote_id: payload.string('account_remote_id'),
      url: payload.string('url'),
      title: title === null ? null : truncateText(title, POST_LIMITS.TITLE_MAX),
      published_at: payload.date('published_at'),
      duration_seconds: payload.nullableNumber('duration_seconds'),
      origin: PostOrigins.IMPORTED,
    },
    metrics: postMetricsOf(payload.record('metrics')),
    observed_at: event.date('occurred_at'),
  };
};
