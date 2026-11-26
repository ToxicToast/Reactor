import {
  SocialPlatforms,
  type SocialPostMetricsV1,
} from '@toxictoast/contracts-events';
import type {
  Compatible,
  Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  ACCOUNT_METRIC_KEYS,
  Platforms,
  POST_METRIC_KEYS,
  type PostMetrics,
} from '@toxictoast/publisher-domain';

describe('Social contracts', () => {
  it('match the metrics of the domain', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<PostMetrics>, SocialPostMetricsV1>,
      true as Compatible<SocialPostMetricsV1, Jsonified<PostMetrics>>,
    ];

    expect(checks).toHaveLength(2);
  });

  it('know the same platforms', () => {
    expect(Object.values(Platforms).sort()).toEqual(
      Object.values(SocialPlatforms).sort(),
    );
  });

  it('report every post metric', () => {
    const contract: Record<keyof SocialPostMetricsV1, true> = {
      views: true,
      likes: true,
      comments: true,
      shares: true,
      saves: true,
      reach: true,
      watch_time_ms: true,
      avg_view_percentage: true,
      followers_gained: true,
    };

    expect(Object.keys(contract).sort()).toEqual([...POST_METRIC_KEYS].sort());
    expect(ACCOUNT_METRIC_KEYS).toEqual(['followers', 'media_count']);
  });
});
