import { randomUUID } from 'node:crypto';
import {
  MediaStatus,
  type MediaAnemic,
  type MediaId,
} from '@toxictoast/blog-domain';
import { PostgresTestDatabase } from '../testing/index.js';
import { TypeOrmMediaRepository } from './typeorm-media.repository.js';

const NOW = new Date('2026-10-20T10:00:00Z');
const EARLIER = new Date('2026-10-20T08:00:00Z');

const media = (overrides: Partial<MediaAnemic> = {}): MediaAnemic => {
  const id = randomUUID();
  return {
    id: id as MediaId,
    object_key: `media/${id}.png`,
    filename: 'hero.png',
    mime_type: 'image/png',
    size: 204800,
    alt_text: null,
    status: MediaStatus.PENDING,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('TypeOrmMediaRepository', () => {
  const database = new PostgresTestDatabase();
  let repository: TypeOrmMediaRepository;

  beforeAll(async () => {
    await database.start();
    repository = new TypeOrmMediaRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a media', async () => {
    const anemic = media({ alt_text: 'Ein Space Marine' });

    await repository.save(anemic);

    expect(await repository.findById(anemic.id)).toEqual(anemic);
  });

  it('finds by status', async () => {
    const pending = media();
    await repository.save(pending);
    await repository.save(media({ status: MediaStatus.READY }));
    await repository.save(media({ deleted_at: NOW }));

    expect(await repository.findByStatus(MediaStatus.PENDING)).toEqual([
      pending,
    ]);
  });

  it('finds by status older than a given date', async () => {
    const stale = media({ created_at: EARLIER });
    await repository.save(stale);
    await repository.save(media());

    const found = await repository.findByStatus(
      MediaStatus.PENDING,
      new Date('2026-10-20T09:00:00Z'),
    );

    expect(found).toEqual([stale]);
  });
});
