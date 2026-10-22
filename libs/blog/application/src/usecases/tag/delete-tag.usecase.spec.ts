import type { DomainContext } from '@toxictoast/shared-kernel';
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
import { InMemoryTagRepository } from '../../testing/index.js';
import { DeleteTagUseCase } from './delete-tag.usecase.js';

const NOW = new Date('2026-10-19T12:00:00Z');
const TAG_ID = 'tag-1' as TagId;

const tagAnemic = (overrides: Partial<TagAnemic> = {}): TagAnemic => {
  return {
    id: TAG_ID,
    title: 'Warhammer',
    slug: 'warhammer',
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('DeleteTagUseCase', () => {
  let repository: InMemoryTagRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: DeleteTagUseCase;

  beforeEach(() => {
    const ctx: DomainContext = {
      id: { generate: () => 'event-1' as never },
      date: { now: () => NOW },
    };
    repository = new InMemoryTagRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new DeleteTagUseCase(
      new TagFactory(ctx),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('soft-deletes the tag and writes the event', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(TAG_ID)?.deleted_at).toEqual(NOW);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['delete']);
  });

  it('succeeds without writing when the tag is already deleted', async () => {
    await repository.save(tagAnemic({ deleted_at: NOW }));

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
    expect(outbox.events).toHaveLength(0);
  });

  it('fails when the tag does not exist', async () => {
    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
