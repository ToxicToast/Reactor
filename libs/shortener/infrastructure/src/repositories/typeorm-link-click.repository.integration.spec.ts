import { randomUUID } from 'node:crypto';
import type { LinkClick, LinkId } from '@toxictoast/shortener-domain';
import { ShortenerTestDatabase } from '../testing/index.js';
import { TypeOrmLinkClickRepository } from './typeorm-link-click.repository.js';

const LINK_ID = randomUUID() as LinkId;
const RANGE = {
  from: new Date('2026-11-01T00:00:00Z'),
  to: new Date('2026-11-30T23:59:59Z'),
};

const click = (overrides: Partial<LinkClick> = {}): LinkClick => {
  return {
    event_id: randomUUID(),
    link_id: LINK_ID,
    clicked_at: new Date('2026-11-25T12:00:00Z'),
    referrer_host: 'youtube.com',
    device: 'mobile',
    browser: 'safari',
    country: 'DE',
    ...overrides,
  };
};

describe('TypeOrmLinkClickRepository', () => {
  const database = new ShortenerTestDatabase();
  let clicks: TypeOrmLinkClickRepository;

  beforeAll(async () => {
    await database.start();
    clicks = new TypeOrmLinkClickRepository(
      database.dataSource,
      database.context,
    );
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('stores an event only once', async () => {
    const event = click();

    expect(await clicks.record(event)).toBe(true);
    expect(await clicks.record(event)).toBe(false);
  });

  it('aggregates by day in the time zone and by dimension', async () => {
    await clicks.record(click());
    await clicks.record(click({ referrer_host: null, country: null }));
    // 23:30 UTC ist in Berlin schon der nächste Tag
    await clicks.record(
      click({ clicked_at: new Date('2026-11-25T23:30:00Z') }),
    );

    const stats = await clicks.stats(LINK_ID, RANGE, 'Europe/Berlin', 10);

    expect(stats.total).toBe(3);
    expect(stats.days).toEqual([
      { day: '2026-11-25', clicks: 2 },
      { day: '2026-11-26', clicks: 1 },
    ]);
    expect(stats.referrers).toEqual([
      { key: 'youtube.com', clicks: 2 },
      { key: 'direct', clicks: 1 },
    ]);
    expect(stats.countries).toEqual([
      { key: 'DE', clicks: 2 },
      { key: 'unknown', clicks: 1 },
    ]);
  });

  it('ignores clicks of other links and outside the range', async () => {
    await clicks.record(click({ link_id: randomUUID() as LinkId }));
    await clicks.record(
      click({ clicked_at: new Date('2026-10-01T12:00:00Z') }),
    );

    const stats = await clicks.stats(LINK_ID, RANGE, 'UTC', 10);

    expect(stats.total).toBe(0);
  });
});
