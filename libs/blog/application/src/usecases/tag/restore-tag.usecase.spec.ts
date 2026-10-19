import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  TagFactory,
  type TagAnemic,
  type TagId,
} from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryTagRepository,
  TEST_NOW,
} from '../../testing/index.js';
import { RestoreTagUseCase } from './restore-tag.usecase.js';

const TAG_ID = 'tag-1' as TagId;

const tagAnemic = (overrides: Partial<TagAnemic> = {}): TagAnemic => {
  return {
    id: TAG_ID,
    title: 'Warhammer',
    slug: 'warhammer',
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('RestoreTagUseCase', () => {
  let repository: InMemoryTagRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: RestoreTagUseCase;

  beforeEach(() => {
    repository = new InMemoryTagRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new RestoreTagUseCase(
      new TagFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('restores a deleted tag and writes the event', async () => {
    await repository.save(tagAnemic({ deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(TAG_ID)?.deleted_at).toBeNull();
    expect(outbox.events.map((e) => e.event_name)).toEqual(['restore']);
  });

  it('succeeds without writing when the tag is not deleted', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the tag does not exist', async () => {
    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
