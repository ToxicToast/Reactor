import type { PollSnapshot } from '@toxictoast/twitch-domain';
import type { PayloadReader } from '@toxictoast/shared-kernel';

export const pollOf = (payload: PayloadReader): PollSnapshot => {
  return {
    poll_id: payload.string('poll_id'),
    title: payload.string('title'),
    choices: payload.list('choices').map((choice) => {
      return {
        id: choice.string('id'),
        title: choice.string('title'),
        votes: choice.number('votes'),
      };
    }),
    status: payload.string('status'),
    started_at: payload.date('started_at'),
    ends_at: payload.nullableDate('ends_at'),
    ended_at: payload.nullableDate('ended_at'),
  };
};
