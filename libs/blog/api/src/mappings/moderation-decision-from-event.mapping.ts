import type { ModerationDecision } from '@toxictoast/blog-application';
import { CommentStatus } from '@toxictoast/blog-domain';
import type { ModerationDecidedPayloadV1 } from '@toxictoast/contracts-events';

export const MODERATION_DECISION_FROM_EVENT: Readonly<
  Record<ModerationDecidedPayloadV1['decision'], ModerationDecision>
> = {
  approved: CommentStatus.APPROVED,
  spam: CommentStatus.SPAM,
  hate: CommentStatus.HATE,
  review: 'review',
};
