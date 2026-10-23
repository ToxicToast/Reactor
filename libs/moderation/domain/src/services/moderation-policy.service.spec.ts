import { ModerationDecision, Verdict } from '../enums/index.js';
import type { Classification } from '../interfaces/index.js';
import { ModerationPolicy } from './moderation-policy.service.js';

const policy = new ModerationPolicy({ approve: 0.95, spam: 0.85, hate: 0.85 });

const classification = (
  verdict: Verdict,
  confidence: number,
  reason = 'Begründung',
): Classification => {
  return { verdict, confidence, reason };
};

describe('ModerationPolicy', () => {
  it.each([
    [Verdict.APPROVED, 0.95, ModerationDecision.APPROVED],
    [Verdict.SPAM, 0.85, ModerationDecision.SPAM],
    [Verdict.HATE, 0.9, ModerationDecision.HATE],
  ])(
    'decides %s at or above its threshold',
    (verdict, confidence, decision) => {
      expect(policy.decide(classification(verdict, confidence))).toEqual({
        decision,
        note: 'Begründung',
      });
    },
  );

  it.each([
    [Verdict.APPROVED, 0.94],
    [Verdict.SPAM, 0.84],
    [Verdict.HATE, 0.5],
  ])('keeps %s below its threshold pending', (verdict, confidence) => {
    expect(policy.decide(classification(verdict, confidence)).decision).toBe(
      ModerationDecision.PENDING,
    );
  });

  it('uses separate thresholds per verdict', () => {
    expect(policy.decide(classification(Verdict.SPAM, 0.9)).decision).toBe(
      ModerationDecision.SPAM,
    );
    expect(policy.decide(classification(Verdict.APPROVED, 0.9)).decision).toBe(
      ModerationDecision.PENDING,
    );
  });

  it('always keeps uncertain verdicts pending', () => {
    expect(policy.decide(classification(Verdict.UNCERTAIN, 1)).decision).toBe(
      ModerationDecision.PENDING,
    );
  });

  it('explains the guess in the note of pending decisions', () => {
    const outcome = policy.decide(
      classification(Verdict.SPAM, 0.62, ' drei Shop-Links '),
    );

    expect(outcome.note).toBe('spam (0.62): drei Shop-Links');
  });

  it.each([Number.NaN, -0.1, 1.5])(
    'never decides with invalid confidence %p',
    (confidence) => {
      const outcome = policy.decide(classification(Verdict.HATE, confidence));

      expect(outcome.decision).toBe(ModerationDecision.PENDING);
      expect(outcome.note).toBe('hate (invalid): Begründung');
    },
  );

  it('stores no note for an empty reason', () => {
    expect(
      policy.decide(classification(Verdict.APPROVED, 0.99, '  ')).note,
    ).toBeNull();
  });
});
