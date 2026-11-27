import { ObservedEvent } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { SOCIAL_EVENTS } from '../constants/index.js';
import type { SocialPostFailure } from '../interfaces/index.js';
import { socialAggregateId } from './social-aggregate-id.function.js';

export const socialPostCheckFailed = (
  ctx: DomainContext,
  failure: SocialPostFailure,
): ObservedEvent<SocialPostFailure> => {
  return new ObservedEvent(
    ctx.id.generate(),
    SOCIAL_EVENTS.POST_TOPIC,
    SOCIAL_EVENTS.CHECK_FAILED,
    socialAggregateId(failure.platform, failure.remote_id),
    ctx.date.now(),
    failure,
  );
};
