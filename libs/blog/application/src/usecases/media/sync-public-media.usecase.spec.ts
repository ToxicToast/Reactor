import { InMemoryFileStorage } from '@toxictoast/shared-application/testing';
import {
  MediaStatus,
  PostStatus,
  type MediaId,
  type PostId,
} from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryMediaRepository,
  InMemoryPostRepository,
  InMemoryPublicMediaRepository,
  mediaAnemic,
  postAnemic,
} from '../../testing/index.js';
import { SyncPublicMediaUseCase } from './sync-public-media.usecase.js';

const IMAGE = '0192f3a0-0000-7000-8000-00000000a001' as MediaId;
const OTHER = '0192f3a0-0000-7000-8000-00000000a002' as MediaId;

describe('SyncPublicMediaUseCase', () => {
  let posts: InMemoryPostRepository;
  let media: InMemoryMediaRepository;
  let publicMedia: InMemoryPublicMediaRepository;
  let storage: InMemoryFileStorage;
  let useCase: SyncPublicMediaUseCase;

  const post = (id: string, status: PostStatus, image: MediaId) => {
    return posts.save(
      postAnemic(id as PostId, { status, blog_image_id: image }),
    );
  };

  beforeEach(async () => {
    posts = new InMemoryPostRepository();
    media = new InMemoryMediaRepository();
    publicMedia = new InMemoryPublicMediaRepository();
    storage = new InMemoryFileStorage();
    useCase = new SyncPublicMediaUseCase(
      posts,
      media,
      publicMedia,
      storage,
      createTestContext(),
    );
    await media.save(mediaAnemic(IMAGE, { status: MediaStatus.READY }));
    await media.save(mediaAnemic(OTHER, { status: MediaStatus.READY }));
  });

  it('publishes the images of published posts', async () => {
    await post('p1', PostStatus.PUBLISHED, IMAGE);
    await post('p2', PostStatus.DRAFT, OTHER);

    const result = await useCase.execute({});

    expect(result.value).toEqual({ published: 1, removed: 0 });
    expect(storage.copies.map((copy) => copy.to)).toEqual([`public/${IMAGE}`]);
    expect(await publicMedia.findAll()).toEqual([IMAGE]);
  });

  it('removes the copy once no published post uses the image', async () => {
    await publicMedia.add(IMAGE, new Date());
    await post('p1', PostStatus.ARCHIVED, IMAGE);

    const result = await useCase.execute({ media_ids: [IMAGE] });

    expect(result.value).toEqual({ published: 0, removed: 1 });
    expect(storage.deleted).toEqual([`public/${IMAGE}`]);
    expect(await publicMedia.findAll()).toEqual([]);
  });

  it('keeps an image public while another published post uses it', async () => {
    await publicMedia.add(IMAGE, new Date());
    await post('p1', PostStatus.ARCHIVED, IMAGE);
    await post('p2', PostStatus.PUBLISHED, IMAGE);

    const result = await useCase.execute({ media_ids: [IMAGE] });

    expect(result.value).toEqual({ published: 0, removed: 0 });
    expect(storage.deleted).toEqual([]);
  });
});
