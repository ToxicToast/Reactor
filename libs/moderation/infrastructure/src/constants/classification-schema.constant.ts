import { Verdict } from '@toxictoast/moderation-domain';

export const CLASSIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: Object.values(Verdict) },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    reason: { type: 'string' },
  },
  required: ['verdict', 'confidence', 'reason'],
  additionalProperties: false,
};
