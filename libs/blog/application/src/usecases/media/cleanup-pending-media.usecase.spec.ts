import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryFileStorage,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  MediaFactory,
  MediaStatus,
  type MediaId,
} from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryMediaRepository,
  mediaAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { CleanupPendingMediaUseCase } from './cleanup-pending-media.usecase.js';

const OLD = new Date('2026-10-17T12:00:00Z');
const RECENT = new Date('2026-10-19T11:00:00Z');

describe('CleanupPendingMediaUseCase', () => {
  let repository: InMemoryMediaRepository;
  let storage: InMemoryFileStorage;
  let outbox: InMemoryOutbox;
  let persistence: DomainPersistence;

  const create = (maxAgeHours: number): CleanupPendingMediaUseCase => {
    return new CleanupPendingMediaUseCase(
      new MediaFactory(createTestContext()),
      repository,
      storage,
      persistence,
      { now: () => TEST_NOW },
      maxAgeHours,
    );
  };

  beforeEach(async () => {
    repository = new InMemoryMediaRepository();
    storage = new InMemoryFileStorage();
    outbox = new InMemoryOutbox();
    persistence = new DomainPersistence(outbox, new ImmediateUnitOfWork());

    await repository.save(mediaAnemic('old-pending', { created_at: OLD }));
    await repository.save(mediaAnemic('new-pending', { created_at: RECENT }));
    await repository.save(
      mediaAnemic('old-ready', { created_at: OLD, status: MediaStatus.READY }),
    );
  });

  it('removes only old pending media and their files', async () => {
    const result = await create(24).execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value.removed).toBe(1);
    expect(
      repository.items.get('old-pending' as MediaId)?.deleted_at,
    ).not.toBeNull();
    expect(
      repository.items.get('new-pending' as MediaId)?.deleted_at,
    ).toBeNull();
    expect(repository.items.get('old-ready' as MediaId)?.deleted_at).toBeNull();
    expect(storage.deleted).toEqual(['media/old-pending.png']);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['delete']);
  });

  it('removes nothing when there is nothing to clean up', async () => {
    const result = await create(48).execute();

    expect(result.value.removed).toBe(0);
    expect(storage.deleted).toHaveLength(0);
  });
});
