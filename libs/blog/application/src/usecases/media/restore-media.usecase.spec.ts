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
} from '../../testing/index.js';
import { RestoreMediaUseCase } from './restore-media.usecase.js';

const ID = 'media-1' as MediaId;

describe('RestoreMediaUseCase', () => {
  let repository: InMemoryMediaRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: RestoreMediaUseCase;

  beforeEach(() => {
    repository = new InMemoryMediaRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new RestoreMediaUseCase(
      new MediaFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('restores deleted media', async () => {
    await repository.save(mediaAnemic('media-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(ID)?.deleted_at).toBeNull();
    expect(outbox.events.map((e) => e.event_name)).toEqual(['restore']);
  });

  it('succeeds without writing when not deleted', async () => {
    await repository.save(mediaAnemic('media-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the media does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
