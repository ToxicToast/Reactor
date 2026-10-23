import {
  ModerationDecision,
  ModerationPolicy,
  Verdict,
} from '@toxictoast/moderation-domain';
import type { ClassificationResult, ModerationResult } from '../data/index.js';
import type {
  ContentClassifier,
  DecisionPublisher,
} from '../interfaces/index.js';
import { ModerateContentUseCase } from './moderate-content.usecase.js';

const policy = new ModerationPolicy({ approve: 0.95, spam: 0.85, hate: 0.85 });

const classifier = (result: ClassificationResult): ContentClassifier => {
  return { classify: jest.fn().mockResolvedValue(result) };
};

class RecordingPublisher implements DecisionPublisher {
  readonly published: Array<ModerationResult> = [];

  async publish(result: ModerationResult): Promise<void> {
    this.published.push(result);
  }
}

const SPAM: ClassificationResult = {
  classification: { verdict: Verdict.SPAM, confidence: 0.91, reason: 'Links' },
  model: 'nvidia/nemotron-nano',
  prompt_version: 'v1',
};

describe('ModerateContentUseCase', () => {
  it('classifies, decides and publishes the result', async () => {
    const publisher = new RecordingPublisher();
    const useCase = new ModerateContentUseCase(
      classifier(SPAM),
      policy,
      publisher,
    );

    const result = await useCase.execute({
      content_id: 'c-1',
      content: 'Billige Uhren!',
    });

    const expected: ModerationResult = {
      content_id: 'c-1',
      decision: ModerationDecision.SPAM,
      note: 'Links',
      confidence: 0.91,
      model: 'nvidia/nemotron-nano',
      prompt_version: 'v1',
    };
    expect(result.value).toEqual(expected);
    expect(publisher.published).toEqual([expected]);
  });

  it('passes the content to the classifier', async () => {
    const spamClassifier = classifier(SPAM);
    const useCase = new ModerateContentUseCase(
      spamClassifier,
      policy,
      new RecordingPublisher(),
    );

    await useCase.execute({ content_id: 'c-1', content: 'Billige Uhren!' });

    expect(spamClassifier.classify).toHaveBeenCalledWith('Billige Uhren!');
  });

  it('lets classifier errors through so the event is retried', async () => {
    const publisher = new RecordingPublisher();
    const failing: ContentClassifier = {
      classify: jest.fn().mockRejectedValue(new Error('nim down')),
    };
    const useCase = new ModerateContentUseCase(failing, policy, publisher);

    await expect(
      useCase.execute({ content_id: 'c-1', content: 'Hallo' }),
    ).rejects.toThrow('nim down');
    expect(publisher.published).toEqual([]);
  });
});
