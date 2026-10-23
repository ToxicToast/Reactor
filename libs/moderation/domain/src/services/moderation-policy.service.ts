import type { Nullable } from '@toxictoast/shared-types';
import { ModerationDecision, Verdict } from '../enums/index.js';
import type {
  Classification,
  ModerationOutcome,
  ModerationThresholds,
} from '../interfaces/index.js';

export class ModerationPolicy {
  constructor(private readonly thresholds: ModerationThresholds) {}

  decide(classification: Classification): ModerationOutcome {
    const threshold = this.thresholdFor(classification.verdict);
    if (
      threshold === null ||
      !this.isValidConfidence(classification.confidence) ||
      classification.confidence < threshold
    ) {
      return {
        decision: ModerationDecision.PENDING,
        note: this.reviewNote(classification),
      };
    }

    return {
      decision: this.decisionFor(classification.verdict),
      note: this.noteOf(classification.reason),
    };
  }

  private thresholdFor(verdict: Verdict): Nullable<number> {
    switch (verdict) {
      case Verdict.APPROVED:
        return this.thresholds.approve;
      case Verdict.SPAM:
        return this.thresholds.spam;
      case Verdict.HATE:
        return this.thresholds.hate;
      case Verdict.UNCERTAIN:
        return null;
    }
  }

  private decisionFor(verdict: Verdict): ModerationDecision {
    switch (verdict) {
      case Verdict.APPROVED:
        return ModerationDecision.APPROVED;
      case Verdict.SPAM:
        return ModerationDecision.SPAM;
      case Verdict.HATE:
        return ModerationDecision.HATE;
      case Verdict.UNCERTAIN:
        return ModerationDecision.PENDING;
    }
  }

  private isValidConfidence(confidence: number): boolean {
    return Number.isFinite(confidence) && confidence >= 0 && confidence <= 1;
  }

  private reviewNote(classification: Classification): string {
    const confidence = this.isValidConfidence(classification.confidence)
      ? classification.confidence.toFixed(2)
      : 'invalid';
    const reason = this.noteOf(classification.reason) ?? 'no reason given';
    return `${classification.verdict} (${confidence}): ${reason}`;
  }

  private noteOf(reason: string): Nullable<string> {
    const trimmed = reason.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }
}
