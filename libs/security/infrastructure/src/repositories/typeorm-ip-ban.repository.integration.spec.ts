import { ipBanAnemic } from '@toxictoast/security-application';
import { SecurityTestDatabase } from '../testing/index.js';
import { TypeOrmIpBanRepository } from './typeorm-ip-ban.repository.js';

const NOW = new Date('2026-10-23T12:10:00Z');

describe('TypeOrmIpBanRepository', () => {
  const database = new SecurityTestDatabase();
  let bans: TypeOrmIpBanRepository;

  beforeAll(async () => {
    await database.start();
    bans = new TypeOrmIpBanRepository(database.dataSource, database.context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('has migrations that match the schemas', async () => {
    const sql = await database.dataSource.driver.createSchemaBuilder().log();

    expect(sql.upQueries).toEqual([]);
  });

  it('saves and loads a ban', async () => {
    const ban = ipBanAnemic('0192f3a0-0000-7000-8000-000000000b01');

    await bans.save(ban);

    expect(await bans.findById(ban.id)).toEqual(ban);
  });

  it('finds only active bans', async () => {
    await bans.save(ipBanAnemic('0192f3a0-0000-7000-8000-000000000b01'));
    await bans.save(
      ipBanAnemic('0192f3a0-0000-7000-8000-000000000b02', {
        ip: '198.51.100.1',
        lifted_at: new Date('2026-10-23T12:05:00Z'),
      }),
    );
    await bans.save(
      ipBanAnemic('0192f3a0-0000-7000-8000-000000000b03', {
        ip: '198.51.100.2',
        banned_until: new Date('2026-10-23T12:05:00Z'),
      }),
    );

    const active = await bans.findActive(NOW);

    expect(active.map((ban) => ban.ip)).toEqual(['203.0.113.7']);
    expect(await bans.findActiveByIp('198.51.100.1', NOW)).toBeNull();
  });

  it('counts the bans of an ip since a date', async () => {
    await bans.save(
      ipBanAnemic('0192f3a0-0000-7000-8000-000000000b01', {
        created_at: new Date('2026-09-01T12:00:00Z'),
      }),
    );
    await bans.save(ipBanAnemic('0192f3a0-0000-7000-8000-000000000b02'));

    await expect(
      bans.countSince('203.0.113.7', new Date('2026-10-01T00:00:00Z')),
    ).resolves.toBe(1);
  });
});
