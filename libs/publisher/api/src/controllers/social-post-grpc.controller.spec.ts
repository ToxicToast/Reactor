import { status } from '@grpc/grpc-js';
import { ImmediateUnitOfWork } from '@toxictoast/shared-application/testing';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc/testing';
import {
  ListDuePostsUseCase,
  RecordPostUseCase,
} from '@toxictoast/publisher-application';
import {
  createTestContext,
  InMemoryPostCheckRepository,
  InMemoryPostRepository,
  InMemoryPostSnapshotRepository,
  post,
  postMetrics,
  TEST_NOW,
} from '@toxictoast/publisher-application/testing';
import { SocialPostGrpcController } from './social-post-grpc.controller.js';

describe('SocialPostGrpcController', () => {
  let actors: TestActorProvider;
  let posts: InMemoryPostRepository;
  let recordPost: RecordPostUseCase;
  let controller: SocialPostGrpcController;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    const checks = new InMemoryPostCheckRepository(posts);
    recordPost = new RecordPostUseCase(
      posts,
      new InMemoryPostSnapshotRepository(),
      checks,
      new ImmediateUnitOfWork(),
    );
    actors = new TestActorProvider(testActor(['publisher.sync']));
    controller = new SocialPostGrpcController(
      new ListDuePostsUseCase(checks, createTestContext()),
      actors,
    );
  });

  it('lists the posts that are due', async () => {
    await posts.save(post('never'));
    await recordPost.execute({
      post: post('fresh'),
      metrics: postMetrics(),
      observed_at: TEST_NOW,
    });

    const { posts: due } = await controller.listDuePosts();

    expect(due).toEqual([
      {
        platform: 'youtube',
        remote_id: 'never',
        published_at: TEST_NOW.toISOString(),
        checked_at: undefined,
      },
    ]);
  });

  it('requires the sync permission', async () => {
    actors.actor = testActor([]);

    await expect(grpcCode(controller.listDuePosts())).resolves.toBe(
      status.PERMISSION_DENIED,
    );
  });
});
