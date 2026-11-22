import { Verdict, type Classification } from '@toxictoast/moderation-domain';
import { readPayload, type Result } from '@toxictoast/shared-kernel';

export const readClassification = (value: unknown): Result<Classification> => {
  return readPayload(value, (reader) => {
    return {
      verdict: reader.oneOf('verdict', Object.values(Verdict)),
      confidence: reader.number('confidence'),
      reason: reader.string('reason'),
    };
  });
};
