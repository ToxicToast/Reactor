import {
  insertOnce,
  TypeOrmTableRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import {
  CLICK_FALLBACK_KEYS,
  type ClickCount,
  type ClickRange,
  type LinkClick,
  type LinkClickRepository,
  type LinkClickStats,
  type LinkId,
} from '@toxictoast/shortener-domain';
import type { DataSource, SelectQueryBuilder } from 'typeorm';
import type { LinkClickRow } from '../interfaces/index.js';
import { LinkClickSchema } from '../schemas/index.js';

export class TypeOrmLinkClickRepository
  extends TypeOrmTableRepository<LinkClickRow>
  implements LinkClickRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, LinkClickSchema);
  }

  record(click: LinkClick): Promise<boolean> {
    return insertOnce(this.repository(), {
      event_id: click.event_id,
      link_id: click.link_id,
      clicked_at: click.clicked_at,
      referrer_host: click.referrer_host,
      device: click.device,
      browser: click.browser,
      country: click.country,
    });
  }

  async stats(
    linkId: LinkId,
    range: ClickRange,
    timeZone: string,
    top: number,
  ): Promise<LinkClickStats> {
    const [total, days, referrers, devices, browsers, countries] =
      await Promise.all([
        this.within(linkId, range).getCount(),
        this.days(linkId, range, timeZone),
        this.countBy(
          linkId,
          range,
          `COALESCE(c.referrer_host, '${CLICK_FALLBACK_KEYS.REFERRER}')`,
          top,
        ),
        this.countBy(linkId, range, 'c.device', top),
        this.countBy(linkId, range, 'c.browser', top),
        this.countBy(
          linkId,
          range,
          `COALESCE(c.country, '${CLICK_FALLBACK_KEYS.COUNTRY}')`,
          top,
        ),
      ]);
    return { total, days, referrers, devices, browsers, countries };
  }

  private within(
    linkId: LinkId,
    range: ClickRange,
  ): SelectQueryBuilder<LinkClickRow> {
    return this.repository()
      .createQueryBuilder('c')
      .where('c.link_id = :linkId', { linkId })
      .andWhere('c.clicked_at BETWEEN :from AND :to', {
        from: range.from,
        to: range.to,
      });
  }

  private async days(
    linkId: LinkId,
    range: ClickRange,
    timeZone: string,
  ): Promise<LinkClickStats['days']> {
    const rows = await this.within(linkId, range)
      .select(
        `to_char(c.clicked_at AT TIME ZONE :timeZone, 'YYYY-MM-DD')`,
        'day',
      )
      .addSelect('COUNT(*)', 'clicks')
      .setParameter('timeZone', timeZone)
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; clicks: string }>();
    return rows.map((row) => ({ day: row.day, clicks: Number(row.clicks) }));
  }

  private async countBy(
    linkId: LinkId,
    range: ClickRange,
    expression: string,
    top: number,
  ): Promise<Array<ClickCount>> {
    const rows = await this.within(linkId, range)
      .select(expression, 'key')
      .addSelect('COUNT(*)', 'clicks')
      .groupBy('key')
      .orderBy('clicks', 'DESC')
      .addOrderBy('key', 'ASC')
      .limit(top)
      .getRawMany<{ key: string; clicks: string }>();
    return rows.map((row) => ({ key: row.key, clicks: Number(row.clicks) }));
  }
}
