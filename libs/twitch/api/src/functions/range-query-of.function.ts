import { parseDate } from '@toxictoast/shared-grpc';
import type { Optional } from '@toxictoast/shared-types';
import type { RangeQuery } from '@toxictoast/twitch-application';
import { parseChannelId } from './parse-channel-id.function.js';

export const rangeQueryOf = (request: {
  readonly channel_id: string;
  readonly from?: Optional<string>;
  readonly to?: Optional<string>;
}): RangeQuery => {
  return {
    channel_id: parseChannelId(request.channel_id),
    from: parseDate(request.from, 'from'),
    to: parseDate(request.to, 'to'),
  };
};
