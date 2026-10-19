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
import { CreateTagUseCase } from './create-tag.usecase.js';

const NOW = new Date('2026-10-19T12:00:00Z');

describe('CreateTagUseCase', () => {
  let repository: InMemoryTagRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: CreateTagUseCase;

  beforeEach(() => {
    let counter = 0;
    const ctx: DomainContext = {
      id: { generate: () => `id-${++counter}` as never },
      date: { now: () => NOW },
    };

    repository = new InMemoryTagRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new CreateTagUseCase(
      new TagFactory(ctx),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  const existingTag = (
    slug: string,
    deletedAt: Date | null = null,
  ): TagAnemic => {
    return {
      id: 'existing' as TagId,
      title: slug,
      slug,
      created_at: NOW,
      updated_at: null,
      deleted_at: deletedAt,
    };
  };

  it('creates and stores the tag', async () => {
    const result = await useCase.execute({ title: 'Warhammer 40k' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.slug).toBe('warhammer-40k');
    expect(repository.items.size).toBe(1);
  });

  it('writes the create event to the outbox inside the unit of work', async () => {
    await useCase.execute({ title: 'Warhammer' });

    expect(uow.runs).toBe(1);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['create']);
    expect(outbox.events[0].event_namespace).toBe('blog.tag');
  });

  it('fails on an invalid title without touching the repository', async () => {
    const result = await useCase.execute({ title: '   ' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(repository.items.size).toBe(0);
    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });

  it('fails when the slug already exists', async () => {
    await repository.save(existingTag('warhammer'));

    const result = await useCase.execute({ title: 'Warhammer' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
    expect(outbox.events).toHaveLength(0);
  });

  it('fails when the slug belongs to a deleted tag', async () => {
    await repository.save(existingTag('warhammer', NOW));

    const result = await useCase.execute({ title: 'Warhammer' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });
});
