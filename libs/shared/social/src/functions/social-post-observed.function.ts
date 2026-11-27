import { ObservedEvent } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { SOCIAL_EVENTS } from '../constants/index.js';
import type { SocialPostObservation } from '../interfaces/index.js';
import { socialAggregateId } from './social-aggregate-id.function.js';

export const socialPostObserved = (
  ctx: DomainContext,
  post: SocialPostObservation,
): ObservedEvent<SocialPostObservation> => {
  return new ObservedEvent(
    ctx.id.generate(),
    SOCIAL_EVENTS.POST_TOPIC,
    SOCIAL_EVENTS.OBSERVED,
    socialAggregateId(post.platform, post.remote_id),
    ctx.date.now(),
    post,
  );
};
