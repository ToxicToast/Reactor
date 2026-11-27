import { ObservedEvent } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { SOCIAL_EVENTS } from '../constants/index.js';
import type { SocialAccountObservation } from '../interfaces/index.js';
import { socialAggregateId } from './social-aggregate-id.function.js';

export const socialAccountObserved = (
  ctx: DomainContext,
  account: SocialAccountObservation,
): ObservedEvent<SocialAccountObservation> => {
  return new ObservedEvent(
    ctx.id.generate(),
    SOCIAL_EVENTS.ACCOUNT_TOPIC,
    SOCIAL_EVENTS.OBSERVED,
    socialAggregateId(account.platform, account.remote_id),
    ctx.date.now(),
    account,
  );
};
