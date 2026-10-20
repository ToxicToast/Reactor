import { randomUUID } from 'node:crypto';
import { status } from '@grpc/grpc-js';
import {
  ArchivePostUseCase,
  categoryAnemic,
  CreatePostUseCase,
  DeletePostUseCase,
  GetPostUseCase,
  GetPublishedPostUseCase,
  InMemoryCategoryRepository,
  InMemoryMediaRepository,
  InMemoryPostRepository,
  InMemoryTagRepository,
  ListPostsUseCase,
  mediaAnemic,
  PostReferencesService,
  PublishPostUseCase,
  RestorePostUseCase,
  UnarchivePostUseCase,
  UpdatePostUseCase,
} from '@toxictoast/blog-application';
import { PostFactory } from '@toxictoast/blog-domain';
import {
  PostStatus as GrpcPostStatus,
  type CreatePostRequest,
  type UpdatePostRequest,
} from '@toxictoast/contracts-grpc';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { grpcCode } from '@toxictoast/shared-grpc';
import {
  ActorType,
  type Actor,
  type ActorProvider,
} from '@toxictoast/shared-kernel';
import { PostGrpcController } from './post-grpc.controller.js';

const NOW = new Date('2026-10-20T12:00:00Z');
const CATEGORY = randomUUID();
const MEDIA = randomUUID();

const AUTHOR = randomUUID();
const USER: Actor = { type: ActorType.USER, id: AUTHOR, ip: null };

const CREATE: CreatePostRequest = {
  title: 'Warhammer 40k',
  content: 'Es gibt nur Krieg.',
  featured: false,
  category_ids: [CATEGORY],
  tag_ids: [],
  hero_image_id: MEDIA,
};

const update = (
  id: string,
  update_mask: Array<string>,
  values: Partial<UpdatePostRequest> = {},
): UpdatePostRequest => {
  return {
    id,
    title: '',
    content: '',
    featured: false,
    category_ids: [],
    tag_ids: [],
    update_mask,
    ...values,
  };
};

describe('PostGrpcController', () => {
  let controller: PostGrpcController;
  let actor: Actor;

  beforeEach(async () => {
    actor = USER;
    const actors: ActorProvider = { current: () => actor };
    const factory = new PostFactory(createUuidTestContext(NOW));
    const posts = new InMemoryPostRepository();
    const categories = new InMemoryCategoryRepository();
    const media = new InMemoryMediaRepository();
    const references = new PostReferencesService(
      categories,
      new InMemoryTagRepository(),
      media,
    );
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    controller = new PostGrpcController(
      new CreatePostUseCase(factory, posts, references, persistence),
      new UpdatePostUseCase(factory, posts, references, persistence),
      new PublishPostUseCase(factory, posts, persistence),
      new ArchivePostUseCase(factory, posts, persistence),
      new UnarchivePostUseCase(factory, posts, persistence),
      new DeletePostUseCase(factory, posts, persistence),
      new RestorePostUseCase(factory, posts, persistence),
      new GetPostUseCase(posts),
      new GetPublishedPostUseCase(posts),
      new ListPostsUseCase(posts),
      actors,
    );

    await categories.save(categoryAnemic(CATEGORY));
    await media.save(mediaAnemic(MEDIA));
  });

  const create = async (): Promise<string> => {
    const { post } = await controller.createPost(CREATE);
    return post?.id ?? '';
  };

  it('creates a draft and maps it to proto', async () => {
    const { post } = await controller.createPost(CREATE);

    expect(post).toMatchObject({
      slug: 'warhammer-40k',
      status: GrpcPostStatus.POST_STATUS_DRAFT,
      category_ids: [CATEGORY],
      hero_image_id: MEDIA,
      excerpt: undefined,
      published_at: undefined,
    });
  });

  it('maps an invalid category id to INVALID_ARGUMENT', async () => {
    const call = controller.createPost({ ...CREATE, category_ids: ['abc'] });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps an unknown category to NOT_FOUND', async () => {
    const call = controller.createPost({
      ...CREATE,
      category_ids: [randomUUID()],
    });

    expect(await grpcCode(call)).toBe(status.NOT_FOUND);
  });

  it('updates only the fields in the mask', async () => {
    const id = await create();

    const { post } = await controller.updatePost(
      update(id, ['title'], { title: 'Neu', content: 'wird ignoriert' }),
    );

    expect(post?.title).toBe('Neu');
    expect(post?.content).toBe('Es gibt nur Krieg.');
    expect(post?.hero_image_id).toBe(MEDIA);
  });

  it('clears a field that is in the mask without a value', async () => {
    const id = await create();

    const { post } = await controller.updatePost(
      update(id, ['hero_image_id', 'category_ids']),
    );

    expect(post?.hero_image_id).toBeUndefined();
    expect(post?.category_ids).toEqual([]);
  });

  it('maps an unknown mask field to INVALID_ARGUMENT', async () => {
    const id = await create();

    const call = controller.updatePost(update(id, ['titel']));

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('publishes backdated and finds the post by slug', async () => {
    const id = await create();

    const { post } = await controller.publishPost({
      id,
      published_at: '2024-05-01T08:00:00Z',
    });
    const published = await controller.getPublishedPost({
      slug: 'warhammer-40k',
    });

    expect(post?.status).toBe(GrpcPostStatus.POST_STATUS_PUBLISHED);
    expect(post?.published_at).toBe('2024-05-01T08:00:00.000Z');
    expect(published.post?.id).toBe(id);
  });

  it('maps an invalid publish date to INVALID_ARGUMENT', async () => {
    const id = await create();

    const call = controller.publishPost({ id, published_at: 'gestern' });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps archiving a draft to FAILED_PRECONDITION', async () => {
    const id = await create();

    expect(await grpcCode(controller.archivePost({ id }))).toBe(
      status.FAILED_PRECONDITION,
    );
  });

  it('filters the list by status and category', async () => {
    const id = await create();
    await controller.publishPost({ id });

    const published = await controller.listPosts({
      status: GrpcPostStatus.POST_STATUS_PUBLISHED,
      category_id: CATEGORY,
    });
    const drafts = await controller.listPosts({
      status: GrpcPostStatus.POST_STATUS_DRAFT,
    });

    expect(published.posts.map((post) => post.id)).toEqual([id]);
    expect(drafts.posts).toEqual([]);
  });

  it('uses the signed-in user as author', async () => {
    const { post } = await controller.createPost(CREATE);

    expect(post?.author_id).toBe(AUTHOR);
  });

  it('rejects posts without a signed-in user', async () => {
    actor = { type: ActorType.ANONYMOUS, id: null, ip: null };

    expect(await grpcCode(controller.createPost(CREATE))).toBe(
      status.UNAUTHENTICATED,
    );
  });
});
