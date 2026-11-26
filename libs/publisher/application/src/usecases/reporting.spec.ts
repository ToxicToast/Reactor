import { ImmediateUnitOfWork } from '@toxictoast/shared-application/testing';
import { TIME_MS } from '@toxictoast/shared-types';
import { METRICS_SCHEDULE, PostOrigins } from '@toxictoast/publisher-domain';
import {
  account,
  createTestContext,
  InMemoryAccountRepository,
  InMemoryAccountSnapshotRepository,
  InMemoryPostCheckRepository,
  InMemoryPostRepository,
  InMemoryPostSnapshotRepository,
  post,
  postMetrics,
  TEST_NOW,
} from '../testing/index.js';
import { ListDuePostsUseCase } from './list-due-posts.usecase.js';
import { RecordAccountUseCase } from './record-account.usecase.js';
import { RecordPostFailureUseCase } from './record-post-failure.usecase.js';
import { RecordPostUseCase } from './record-post.usecase.js';

const ago = (ms: number): Date => new Date(TEST_NOW.getTime() - ms);

describe('Reporting', () => {
  let posts: InMemoryPostRepository;
  let postSnapshots: InMemoryPostSnapshotRepository;
  let checks: InMemoryPostCheckRepository;
  let accountSnapshots: InMemoryAccountSnapshotRepository;
  let recordPost: RecordPostUseCase;
  let recordFailure: RecordPostFailureUseCase;
  let recordAccount: RecordAccountUseCase;
  let listDue: ListDuePostsUseCase;

  beforeEach(() => {
    const uow = new ImmediateUnitOfWork();
    posts = new InMemoryPostRepository();
    postSnapshots = new InMemoryPostSnapshotRepository();
    checks = new InMemoryPostCheckRepository(posts);
    accountSnapshots = new InMemoryAccountSnapshotRepository();
    recordPost = new RecordPostUseCase(posts, postSnapshots, checks, uow);
    recordFailure = new RecordPostFailureUseCase(checks);
    recordAccount = new RecordAccountUseCase(
      new InMemoryAccountRepository(),
      accountSnapshots,
      uow,
    );
    listDue = new ListDuePostsUseCase(checks, createTestContext());
  });

  describe('posts', () => {
    it('records a snapshot only when a metric changed', async () => {
      const first = await recordPost.execute({
        post: post('video-1'),
        metrics: postMetrics(),
        observed_at: ago(TIME_MS.HOUR),
      });
      const same = await recordPost.execute({
        post: post('video-1'),
        metrics: postMetrics(),
        observed_at: ago(30 * TIME_MS.MINUTE),
      });
      const more = await recordPost.execute({
        post: post('video-1'),
        metrics: postMetrics({ views: 150 }),
        observed_at: TEST_NOW,
      });

      expect(first.value.snapshot_recorded).toBe(true);
      expect(same.value.snapshot_recorded).toBe(false);
      expect(more.value.snapshot_recorded).toBe(true);
      expect(postSnapshots.items).toHaveLength(2);
    });

    it('keeps the origin of a post that was published by the publisher', async () => {
      await recordPost.execute({
        post: post('video-1', { origin: PostOrigins.PUBLISHED }),
        metrics: postMetrics(),
        observed_at: TEST_NOW,
      });
      await recordPost.execute({
        post: post('video-1', { origin: PostOrigins.IMPORTED }),
        metrics: postMetrics(),
        observed_at: TEST_NOW,
      });

      expect(
        (await posts.find({ platform: 'youtube', remote_id: 'video-1' }))
          ?.origin,
      ).toBe(PostOrigins.PUBLISHED);
    });

    it('resets the failures after a successful check', async () => {
      const ref = { platform: 'youtube' as const, remote_id: 'video-1' };
      await recordPost.execute({
        post: post('video-1'),
        metrics: postMetrics(),
        observed_at: ago(TIME_MS.HOUR),
      });
      await recordFailure.execute({
        post: ref,
        failed_at: ago(30 * TIME_MS.MINUTE),
        error: 'quota exceeded',
      });
      await recordPost.execute({
        post: post('video-1'),
        metrics: postMetrics(),
        observed_at: TEST_NOW,
      });

      expect(await checks.find(ref)).toMatchObject({
        failures: 0,
        last_error: null,
      });
    });
  });

  describe('due posts', () => {
    it('lists never checked posts and respects the interval of the age tier', async () => {
      await posts.save(post('never', { published_at: ago(TIME_MS.DAY) }));
      await recordPost.execute({
        post: post('fresh', { published_at: ago(TIME_MS.HOUR) }),
        metrics: postMetrics(),
        observed_at: ago(10 * TIME_MS.MINUTE),
      });
      await recordPost.execute({
        post: post('waiting', { published_at: ago(TIME_MS.HOUR) }),
        metrics: postMetrics(),
        observed_at: ago(20 * TIME_MS.MINUTE),
      });

      const due = await listDue.execute();

      expect(due.value.map((candidate) => candidate.post.remote_id)).toEqual([
        'never',
        'waiting',
      ]);
    });

    it('suspends a post after too many failures in a row', async () => {
      const ref = { platform: 'youtube' as const, remote_id: 'gone' };
      await posts.save(post('gone', { published_at: ago(400 * TIME_MS.DAY) }));
      for (
        let attempt = 0;
        attempt < METRICS_SCHEDULE.MAX_FAILURES;
        attempt++
      ) {
        await recordFailure.execute({
          post: ref,
          failed_at: ago(60 * TIME_MS.DAY),
          error: 'video not found',
        });
      }

      const due = await listDue.execute();

      expect(due.value).toEqual([]);
    });
  });

  describe('accounts', () => {
    it('records a snapshot only when followers or media count changed', async () => {
      const metrics = { followers: 120, media_count: 40 };
      await recordAccount.execute({
        account: account('channel-1'),
        metrics,
        observed_at: ago(TIME_MS.DAY),
      });
      await recordAccount.execute({
        account: account('channel-1'),
        metrics,
        observed_at: TEST_NOW,
      });

      expect(accountSnapshots.items).toHaveLength(1);
    });
  });
});
