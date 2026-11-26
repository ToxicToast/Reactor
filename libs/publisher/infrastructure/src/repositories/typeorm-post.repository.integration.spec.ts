import {
  PostOrigins,
  type Post,
  type PostMetrics,
} from '@toxictoast/publisher-domain';
import { PublisherTestDatabase } from '../testing/index.js';
import { TypeOrmPostCheckRepository } from './typeorm-post-check.repository.js';
import { TypeOrmPostSnapshotRepository } from './typeorm-post-snapshot.repository.js';
import { TypeOrmPostRepository } from './typeorm-post.repository.js';

const NOW = new Date('2026-11-25T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const ago = (ms: number): Date => new Date(NOW.getTime() - ms);

const post = (remoteId: string, overrides: Partial<Post> = {}): Post => {
  return {
    platform: 'youtube',
    remote_id: remoteId,
    account_remote_id: 'channel-1',
    url: `https://www.youtube.com/shorts/${remoteId}`,
    title: 'Der Flamer war vielleicht eine dumme Idee',
    published_at: ago(HOUR),
    duration_seconds: 42.5,
    origin: PostOrigins.IMPORTED,
    ...overrides,
  };
};

const metrics = (overrides: Partial<PostMetrics> = {}): PostMetrics => {
  return {
    views: 100,
    likes: 5,
    comments: 1,
    shares: null,
    saves: null,
    reach: null,
    watch_time_ms: 3_000_000_000,
    avg_view_percentage: 61.5,
    followers_gained: 2,
    ...overrides,
  };
};

describe('Publisher post repositories', () => {
  const database = new PublisherTestDatabase();
  let posts: TypeOrmPostRepository;
  let snapshots: TypeOrmPostSnapshotRepository;
  let checks: TypeOrmPostCheckRepository;

  beforeAll(async () => {
    await database.start();
    posts = new TypeOrmPostRepository(database.dataSource, database.context);
    snapshots = new TypeOrmPostSnapshotRepository(
      database.dataSource,
      database.context,
    );
    checks = new TypeOrmPostCheckRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('updates a post but keeps its origin', async () => {
    await posts.save(post('video-1', { origin: PostOrigins.PUBLISHED }));
    await posts.save(post('video-1', { title: 'Neuer Titel' }));

    expect(
      await posts.find({ platform: 'youtube', remote_id: 'video-1' }),
    ).toMatchObject({ title: 'Neuer Titel', origin: PostOrigins.PUBLISHED });
  });

  it('returns the latest snapshot with large watch times intact', async () => {
    const ref = { platform: 'youtube' as const, remote_id: 'video-1' };
    await snapshots.record({
      post: ref,
      observed_at: ago(HOUR),
      metrics: metrics(),
    });
    await snapshots.record({
      post: ref,
      observed_at: NOW,
      metrics: metrics({ views: 150 }),
    });
    // ein Replay desselben Standes
    await snapshots.record({
      post: ref,
      observed_at: NOW,
      metrics: metrics({ views: 150 }),
    });

    expect(await snapshots.latest(ref)).toEqual({
      post: ref,
      observed_at: NOW,
      metrics: metrics({ views: 150 }),
    });
  });

  it('lists never checked posts first and skips suspended ones', async () => {
    await posts.save(post('checked'));
    await posts.save(post('never'));
    await posts.save(post('suspended'));
    await checks.save({
      post: { platform: 'youtube', remote_id: 'checked' },
      checked_at: ago(HOUR),
      failures: 0,
      last_error: null,
    });
    await checks.save({
      post: { platform: 'youtube', remote_id: 'suspended' },
      checked_at: ago(HOUR),
      failures: 5,
      last_error: 'video not found',
    });

    const due = await checks.candidates(5);

    expect(due.map((candidate) => candidate.post.remote_id)).toEqual([
      'never',
      'checked',
    ]);
    expect(due[0].checked_at).toBeNull();
  });
});
