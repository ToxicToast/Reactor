import {
  BlogModerationDecision,
  type ModerationDecidedPayloadV1,
} from '@toxictoast/contracts-events';
import { ModerationDecision } from '@toxictoast/moderation-domain';

export const DECISION_TO_EVENT: Readonly<
  Record<ModerationDecision, ModerationDecidedPayloadV1['decision']>
> = {
  [ModerationDecision.APPROVED]: BlogModerationDecision.APPROVED,
  [ModerationDecision.SPAM]: BlogModerationDecision.SPAM,
  [ModerationDecision.HATE]: BlogModerationDecision.HATE,
  [ModerationDecision.PENDING]: BlogModerationDecision.PENDING,
};
