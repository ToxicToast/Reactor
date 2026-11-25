import type { LinkId } from '@toxictoast/shortener-domain';
import {
  createTestContext,
  InMemoryLinkClickRepository,
  InMemoryLinkRepository,
  linkAnemic,
  rawClick,
  TEST_NOW,
} from '../testing/index.js';
import { GetLinkStatsUseCase } from './get-link-stats.usecase.js';
import { RecordClickUseCase } from './record-click.usecase.js';

const LINK_ID = 'link-1' as LinkId;

describe('Clicks', () => {
  let links: InMemoryLinkRepository;
  let clicks: InMemoryLinkClickRepository;
  let record: RecordClickUseCase;
  let stats: GetLinkStatsUseCase;

  beforeEach(async () => {
    links = new InMemoryLinkRepository();
    clicks = new InMemoryLinkClickRepository();
    record = new RecordClickUseCase(clicks);
    stats = new GetLinkStatsUseCase(
      links,
      clicks,
      { time_zone: 'Europe/Berlin' },
      createTestContext(),
    );
    await links.save(linkAnemic(LINK_ID));
  });

  it('counts a replayed event only once', async () => {
    expect((await record.execute(rawClick('event-1'))).value).toEqual({
      recorded: true,
    });
    expect((await record.execute(rawClick('event-1'))).value).toEqual({
      recorded: false,
    });

    const result = await stats.execute({ id: LINK_ID });
    expect(result.value.total).toBe(1);
  });

  it('groups by referrer, device and day', async () => {
    await record.execute(rawClick('event-1'));
    await record.execute(rawClick('event-2'));
    await record.execute(rawClick('event-3', { referer: null }));

    const result = await stats.execute({ id: LINK_ID });

    expect(result.value).toMatchObject({
      total: 3,
      days: [{ day: '2026-11-24', clicks: 3 }],
      referrers: [
        { key: 'youtube.com', clicks: 2 },
        { key: 'direct', clicks: 1 },
      ],
      devices: [{ key: 'mobile', clicks: 3 }],
    });
  });

  it('only counts clicks within the range', async () => {
    await record.execute(
      rawClick('old', { clicked_at: new Date('2026-09-01T12:00:00Z') }),
    );
    await record.execute(rawClick('new'));

    const result = await stats.execute({ id: LINK_ID, to: TEST_NOW });

    expect(result.value.total).toBe(1);
  });

  it('fails for unknown links', async () => {
    const result = await stats.execute({ id: 'unknown' as LinkId });

    expect(result.isFailure).toBe(true);
  });
});
