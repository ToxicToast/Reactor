import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { MediaFactory, type MediaId } from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryMediaRepository,
  mediaAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { UpdateMediaAltTextUseCase } from './update-media-alt-text.usecase.js';

const ID = 'media-1' as MediaId;

describe('UpdateMediaAltTextUseCase', () => {
  let repository: InMemoryMediaRepository;
  let outbox: InMemoryOutbox;
  let useCase: UpdateMediaAltTextUseCase;

  beforeEach(() => {
    repository = new InMemoryMediaRepository();
    outbox = new InMemoryOutbox();
    useCase = new UpdateMediaAltTextUseCase(
      new MediaFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('updates the alt text', async () => {
    await repository.save(mediaAnemic('media-1'));

    const result = await useCase.execute({
      id: ID,
      alt_text: 'Ein Space Marine',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.alt_text).toBe('Ein Space Marine');
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('fails on alt text above the limit', async () => {
    await repository.save(mediaAnemic('media-1'));

    const result = await useCase.execute({ id: ID, alt_text: 'a'.repeat(501) });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });

  it('treats deleted media as not found', async () => {
    await repository.save(mediaAnemic('media-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, alt_text: 'Neu' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
