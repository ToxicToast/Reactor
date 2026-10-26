import { auditEntry } from '@toxictoast/audit-application';
import { PostgresTestDatabase } from '../testing/index.js';
import { TypeOrmAuditRepository } from './typeorm-audit.repository.js';

const ID = (n: number): string => `0192f3a0-0000-7000-8000-00000000000${n}`;

describe('TypeOrmAuditRepository', () => {
  const database = new PostgresTestDatabase();
  let audit: TypeOrmAuditRepository;

  beforeAll(async () => {
    await database.start();
    audit = new TypeOrmAuditRepository(database.dataSource);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('has migrations that match the schemas', async () => {
    const sql = await database.dataSource.driver.createSchemaBuilder().log();

    expect(sql.upQueries).toEqual([]);
  });

  it('records an event once, even when it is delivered twice', async () => {
    const entry = auditEntry(ID(1));

    await audit.record(entry);
    await audit.record({ ...entry, payload: { title: 'changed' } });

    expect(await audit.find({})).toEqual([entry]);
  });

  it('filters by correlation id and time range, newest first', async () => {
    await audit.record(
      auditEntry(ID(1), { occurred_at: new Date('2026-10-26T10:00:00Z') }),
    );
    await audit.record(
      auditEntry(ID(2), { occurred_at: new Date('2026-10-26T11:00:00Z') }),
    );
    await audit.record(
      auditEntry(ID(3), {
        correlation_id: '01a16a00-bbbb-7000-8000-000000000001',
      }),
    );

    const found = await audit.find({
      correlation_id: '01a16a00-aaaa-7000-8000-000000000001',
      from: new Date('2026-10-26T09:00:00Z'),
      to: new Date('2026-10-26T12:00:00Z'),
    });

    expect(found.map((entry) => entry.event_id)).toEqual([ID(2), ID(1)]);
  });

  it('deletes only what a rule covers', async () => {
    await audit.record(
      auditEntry(ID(1), {
        event_namespace: 'security.access',
        occurred_at: new Date('2026-09-01T12:00:00Z'),
      }),
    );
    await audit.record(
      auditEntry(ID(2), { occurred_at: new Date('2026-09-01T12:00:00Z') }),
    );

    const removed = await audit.deleteBefore({
      before: new Date('2026-09-26T12:00:00Z'),
      include: ['security.access'],
    });

    expect(removed).toBe(1);
    expect((await audit.find({})).map((entry) => entry.event_id)).toEqual([
      ID(2),
    ]);
  });
});
