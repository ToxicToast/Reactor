import { Verdict, type Classification } from '@toxictoast/moderation-domain';

const VERDICTS: ReadonlyArray<string> = Object.values(Verdict);

export const isClassification = (value: unknown): value is Classification => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['verdict'] === 'string' &&
    VERDICTS.includes(candidate['verdict']) &&
    typeof candidate['confidence'] === 'number' &&
    typeof candidate['reason'] === 'string'
  );
};
