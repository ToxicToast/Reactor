import { randomUUID } from 'node:crypto';
import {
  ModerateContentUseCase,
  type ContentClassifier,
  type DecisionPublisher,
  type ModerationResult,
} from '@toxictoast/moderation-application';
import {
  ModerationDecision,
  ModerationPolicy,
  Verdict,
} from '@toxictoast/moderation-domain';
import { ModerationRequestedHandler } from './moderation-requested.handler.js';

const COMMENT = randomUUID();

const payload = (overrides: Record<string, unknown> = {}) => {
  return {
    id: COMMENT,
    content: 'Für den Imperator!',
    deleted_at: null,
    ...overrides,
  };
};

describe('ModerationRequestedHandler', () => {
  let classify: jest.Mock;
  let published: Array<ModerationResult>;
  let handler: ModerationRequestedHandler;

  beforeEach(() => {
    classify = jest.fn().mockResolvedValue({
      classification: {
        verdict: Verdict.APPROVED,
        confidence: 0.99,
        reason: 'harmlos',
      },
      model: 'nvidia/nemotron-nano',
      prompt_version: 'v1',
    });
    published = [];
    const classifier: ContentClassifier = { classify };
    const publisher: DecisionPublisher = {
      publish: async (result) => {
        published.push(result);
      },
    };
    handler = new ModerationRequestedHandler(
      new ModerateContentUseCase(
        classifier,
        new ModerationPolicy({ approve: 0.95, spam: 0.85, hate: 0.85 }),
        publisher,
      ),
    );
  });

  it('moderates the comment and publishes the decision', async () => {
    await handler.handle(payload());

    expect(classify).toHaveBeenCalledWith('Für den Imperator!');
    expect(published).toEqual([
      expect.objectContaining({
        content_id: COMMENT,
        decision: ModerationDecision.APPROVED,
      }),
    ]);
  });

  it.each([
    ['no object', null],
    ['an invalid id', payload({ id: 'abc' })],
    ['missing content', payload({ content: undefined })],
  ])('ignores %s', async (_label, value) => {
    await handler.handle(value);

    expect(classify).not.toHaveBeenCalled();
  });

  it('skips deleted comments', async () => {
    await handler.handle(payload({ deleted_at: '2026-10-23T12:00:00.000Z' }));

    expect(classify).not.toHaveBeenCalled();
  });

  it('lets errors through so the event is retried', async () => {
    classify.mockRejectedValue(new Error('nim down'));

    await expect(handler.handle(payload())).rejects.toThrow('nim down');
  });
});
