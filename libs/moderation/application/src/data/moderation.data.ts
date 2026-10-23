import type {
  Classification,
  ModerationDecision,
} from '@toxictoast/moderation-domain';
import type { Nullable } from '@toxictoast/shared-types';

export interface ModerateContentInput {
  readonly content_id: string;
  readonly content: string;
}

export interface ClassificationResult {
  readonly classification: Classification;
  readonly model: string;
  readonly prompt_version: string;
}

export interface ModerationResult {
  readonly content_id: string;
  readonly decision: ModerationDecision;
  readonly note: Nullable<string>;
  readonly confidence: number;
  readonly model: string;
  readonly prompt_version: string;
}
