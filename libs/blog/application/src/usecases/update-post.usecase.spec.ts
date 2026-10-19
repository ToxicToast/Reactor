import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  PostFactory,
  type MediaId,
  type PostId,
  type TagId,
} from '@toxictoast/blog-domain';
import { PostReferencesService } from '../services/index.js';
import {
  createTestContext,
  InMemoryCategoryRepository,
  InMemoryMediaRepository,
  InMemoryPostRepository,
  InMemoryTagRepository,
  mediaAnemic,
  postAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { UpdatePostUseCase } from './update-post.usecase.js';

const ID = 'post-1' as PostId;

describe('UpdatePostUseCase', () => {
  let posts: InMemoryPostRepository;
  let media: InMemoryMediaRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: UpdatePostUseCase;

  beforeEach(async () => {
    posts = new InMemoryPostRepository();
    media = new InMemoryMediaRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new UpdatePostUseCase(
      new PostFactory(createTestContext()),
      posts,
      new PostReferencesService(
        new InMemoryCategoryRepository(),
        new InMemoryTagRepository(),
        media,
      ),
      new DomainPersistence(outbox, uow),
    );

    await posts.save(postAnemic('post-1'));
  });

  it('updates the title and keeps the slug', async () => {
    const result = await useCase.execute({ id: ID, title: 'Neuer Titel' });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      title: 'Neuer Titel',
      slug: 'post-1',
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('sets an existing image', async () => {
    await media.save(mediaAnemic('media-1'));

    const result = await useCase.execute({
      id: ID,
      hero_image_id: 'media-1' as MediaId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.hero_image_id).toBe('media-1');
  });

  it('fails on a missing image without changing the post', async () => {
    const result = await useCase.execute({
      id: ID,
      title: 'Neu',
      hero_image_id: 'missing' as MediaId,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
    expect(posts.items.get(ID)?.title).toBe('post-1');
    expect(uow.runs).toBe(0);
  });

  it('fails on a missing tag', async () => {
    const result = await useCase.execute({
      id: ID,
      tag_ids: ['missing' as TagId],
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('does not write when nothing changes', async () => {
    const result = await useCase.execute({ id: ID, title: 'post-1' });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('treats a deleted post as not found', async () => {
    await posts.save(postAnemic('post-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, title: 'Neu' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
