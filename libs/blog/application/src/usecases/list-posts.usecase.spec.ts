import {
  PostStatus,
  type CategoryId,
  type PostAnemic,
  type TagId,
} from '@toxictoast/blog-domain';
import {
  InMemoryPostRepository,
  postAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { ListPostsUseCase } from './list-posts.usecase.js';

const CAT = 'cat-1' as CategoryId;
const TAG = 'tag-1' as TagId;

describe('ListPostsUseCase', () => {
  let posts: InMemoryPostRepository;
  let useCase: ListPostsUseCase;

  beforeEach(async () => {
    posts = new InMemoryPostRepository();
    useCase = new ListPostsUseCase(posts);

    await posts.save(
      postAnemic('p-1', {
        status: PostStatus.PUBLISHED,
        category_ids: [CAT],
        tag_ids: [TAG],
      }),
    );
    await posts.save(postAnemic('p-2', { category_ids: [CAT] }));
    await posts.save(postAnemic('p-3', { status: PostStatus.PUBLISHED }));
    await posts.save(
      postAnemic('p-4', { status: PostStatus.PUBLISHED, deleted_at: TEST_NOW }),
    );
  });

  const ids = (list: Array<PostAnemic>): Array<string> => {
    return list.map((post) => post.id);
  };

  it('returns all posts without deleted ones', async () => {
    const result = await useCase.execute({});

    expect(ids(result.value)).toEqual(['p-1', 'p-2', 'p-3']);
  });

  it('filters by status', async () => {
    const result = await useCase.execute({ status: PostStatus.PUBLISHED });

    expect(ids(result.value)).toEqual(['p-1', 'p-3']);
  });

  it('filters by category', async () => {
    const result = await useCase.execute({ category_id: CAT });

    expect(ids(result.value)).toEqual(['p-1', 'p-2']);
  });

  it('filters by category and status', async () => {
    const result = await useCase.execute({
      category_id: CAT,
      status: PostStatus.PUBLISHED,
    });

    expect(ids(result.value)).toEqual(['p-1']);
  });

  it('filters by tag', async () => {
    const result = await useCase.execute({ tag_id: TAG });

    expect(ids(result.value)).toEqual(['p-1']);
  });

  it('applies limit and offset', async () => {
    const result = await useCase.execute({ limit: 1, offset: 1 });

    expect(ids(result.value)).toEqual(['p-2']);
  });
});
