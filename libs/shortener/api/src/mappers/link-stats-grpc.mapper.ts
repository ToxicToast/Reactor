import type {
  ClickCount as ClickCountProto,
  LinkStats,
} from '@toxictoast/contracts-grpc';
import type { ClickCount, LinkClickStats } from '@toxictoast/shortener-domain';

export class LinkStatsGrpcMapper {
  toProto(stats: LinkClickStats): LinkStats {
    return {
      total: stats.total,
      days: stats.days.map((day) => {
        return { day: day.day, clicks: day.clicks };
      }),
      referrers: this.counts(stats.referrers),
      devices: this.counts(stats.devices),
      browsers: this.counts(stats.browsers),
      countries: this.counts(stats.countries),
    };
  }

  private counts(counts: ReadonlyArray<ClickCount>): Array<ClickCountProto> {
    return counts.map((count) => {
      return { key: count.key, clicks: count.clicks };
    });
  }
}
