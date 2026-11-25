import { statsDayOf } from '@toxictoast/shared-kernel';
import {
  CLICK_FALLBACK_KEYS,
  type ClickCount,
  type ClickRange,
  type LinkClick,
  type LinkClickRepository,
  type LinkClickStats,
  type LinkId,
} from '@toxictoast/shortener-domain';

export class InMemoryLinkClickRepository implements LinkClickRepository {
  readonly items = new Map<string, LinkClick>();

  async record(click: LinkClick): Promise<boolean> {
    if (this.items.has(click.event_id)) {
      return false;
    }
    this.items.set(click.event_id, click);
    return true;
  }

  async stats(
    linkId: LinkId,
    range: ClickRange,
    timeZone: string,
    top: number,
  ): Promise<LinkClickStats> {
    const clicks = [...this.items.values()].filter((click) => {
      return (
        click.link_id === linkId &&
        click.clicked_at >= range.from &&
        click.clicked_at <= range.to
      );
    });
    const days = this.countBy(clicks, (click) => {
      return statsDayOf(click.clicked_at, timeZone);
    })
      .map((count) => ({ day: count.key, clicks: count.clicks }))
      .sort((a, b) => a.day.localeCompare(b.day));

    return {
      total: clicks.length,
      days,
      referrers: this.top(
        clicks,
        (click) => click.referrer_host ?? CLICK_FALLBACK_KEYS.REFERRER,
        top,
      ),
      devices: this.top(clicks, (click) => click.device, top),
      browsers: this.top(clicks, (click) => click.browser, top),
      countries: this.top(
        clicks,
        (click) => click.country ?? CLICK_FALLBACK_KEYS.COUNTRY,
        top,
      ),
    };
  }

  private top(
    clicks: ReadonlyArray<LinkClick>,
    keyOf: (click: LinkClick) => string,
    limit: number,
  ): Array<ClickCount> {
    return this.countBy(clicks, keyOf)
      .sort((a, b) => b.clicks - a.clicks || a.key.localeCompare(b.key))
      .slice(0, limit);
  }

  private countBy(
    clicks: ReadonlyArray<LinkClick>,
    keyOf: (click: LinkClick) => string,
  ): Array<ClickCount> {
    const counts = new Map<string, number>();
    for (const click of clicks) {
      const key = keyOf(click);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts].map(([key, clicks]) => ({ key, clicks }));
  }
}
