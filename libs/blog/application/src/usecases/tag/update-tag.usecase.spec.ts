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
import { UpdateTagUseCase } from './update-tag.usecase.js';

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

describe('UpdateTagUseCase', () => {
  let repository: InMemoryTagRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: UpdateTagUseCase;

  beforeEach(() => {
    const ctx: DomainContext = {
      id: { generate: () => 'event-1' as never },
      date: { now: () => NOW },
    };
    repository = new InMemoryTagRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new UpdateTagUseCase(
      new TagFactory(ctx),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('updates the title, keeps the slug and writes the event', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({
      id: TAG_ID,
      title: 'Warhammer 40k',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      title: 'Warhammer 40k',
      slug: 'warhammer',
    });
    expect(repository.items.get(TAG_ID)?.title).toBe('Warhammer 40k');
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('does not write when nothing changes', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({ id: TAG_ID, title: 'Warhammer' });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
    expect(outbox.events).toHaveLength(0);
  });

  it('fails when the tag does not exist', async () => {
    const result = await useCase.execute({ id: TAG_ID, title: 'Neu' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('treats a deleted tag as not found', async () => {
    await repository.save(tagAnemic({ deleted_at: NOW }));

    const result = await useCase.execute({ id: TAG_ID, title: 'Neu' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('passes validation errors through', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({ id: TAG_ID, title: '   ' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(outbox.events).toHaveLength(0);
  });
});
