import type { Account } from '@toxictoast/publisher-domain';
import { PublisherTestDatabase } from '../testing/index.js';
import { TypeOrmAccountSnapshotRepository } from './typeorm-account-snapshot.repository.js';
import { TypeOrmAccountRepository } from './typeorm-account.repository.js';

const NOW = new Date('2026-11-25T12:00:00Z');

const account: Account = {
  platform: 'youtube',
  remote_id: 'channel-1',
  handle: '@ToxicToastTTV',
  display_name: 'ToxicToast',
  url: 'https://www.youtube.com/@ToxicToastTTV',
};

describe('Publisher account repositories', () => {
  const database = new PublisherTestDatabase();
  let accounts: TypeOrmAccountRepository;
  let snapshots: TypeOrmAccountSnapshotRepository;

  beforeAll(async () => {
    await database.start();
    accounts = new TypeOrmAccountRepository(
      database.dataSource,
      database.context,
    );
    snapshots = new TypeOrmAccountSnapshotRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('overwrites an account on save', async () => {
    await accounts.save(account);
    await accounts.save({ ...account, display_name: 'Toxic Toast' });

    expect(await accounts.list()).toEqual([
      { ...account, display_name: 'Toxic Toast' },
    ]);
  });

  it('returns the latest account snapshot', async () => {
    const ref = { platform: 'youtube' as const, remote_id: 'channel-1' };
    await snapshots.record({
      account: ref,
      observed_at: new Date('2026-11-24T12:00:00Z'),
      metrics: { followers: 120, media_count: 40 },
    });
    await snapshots.record({
      account: ref,
      observed_at: NOW,
      metrics: { followers: 125, media_count: 41 },
    });

    expect((await snapshots.latest(ref))?.metrics).toEqual({
      followers: 125,
      media_count: 41,
    });
  });
});
