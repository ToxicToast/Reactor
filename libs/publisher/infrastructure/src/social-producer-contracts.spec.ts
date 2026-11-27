import {
  SocialAccountEvents,
  SocialPlatforms as ContractPlatforms,
  SocialPostEvents,
  SocialTopics,
  type SocialAccountPayloadV1,
  type SocialPostCheckFailedPayloadV1,
  type SocialPostMetricsV1,
  type SocialPostPayloadV1,
} from '@toxictoast/contracts-events';
import type {
  Compatible,
  Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  SOCIAL_EVENTS,
  SOCIAL_POST_METRIC_KEYS,
  SocialPlatforms,
  type SocialAccountObservation,
  type SocialPostFailure,
  type SocialPostObservation,
} from '@toxictoast/shared-social';

describe('Social producer contracts', () => {
  it('match the serialized payloads in both directions', () => {
    const checks: Array<true> = [
      true as Compatible<
        Jsonified<SocialAccountObservation>,
        SocialAccountPayloadV1
      >,
      true as Compatible<
        SocialAccountPayloadV1,
        Jsonified<SocialAccountObservation>
      >,
      true as Compatible<Jsonified<SocialPostObservation>, SocialPostPayloadV1>,
      true as Compatible<SocialPostPayloadV1, Jsonified<SocialPostObservation>>,
      true as Compatible<
        Jsonified<SocialPostFailure>,
        SocialPostCheckFailedPayloadV1
      >,
      true as Compatible<
        SocialPostCheckFailedPayloadV1,
        Jsonified<SocialPostFailure>
      >,
    ];

    expect(checks).toHaveLength(6);
  });

  it('publish under the contract topics and names', () => {
    expect(SOCIAL_EVENTS.ACCOUNT_TOPIC).toBe(SocialTopics.ACCOUNT);
    expect(SOCIAL_EVENTS.POST_TOPIC).toBe(SocialTopics.POST);
    expect(SOCIAL_EVENTS.OBSERVED).toBe(SocialAccountEvents.OBSERVED);
    expect(SOCIAL_EVENTS.OBSERVED).toBe(SocialPostEvents.OBSERVED);
    expect(SOCIAL_EVENTS.CHECK_FAILED).toBe(SocialPostEvents.CHECK_FAILED);
  });

  it('know the same platforms and metrics', () => {
    expect(SocialPlatforms).toEqual(ContractPlatforms);

    const contract: Record<keyof SocialPostMetricsV1, true> = {
      views: true,
      likes: true,
      comments: true,
      shares: true,
      saves: true,
      reach: true,
      avg_watch_time_ms: true,
      total_watch_time_ms: true,
      avg_view_percentage: true,
      followers_gained: true,
    };
    expect(Object.keys(contract).sort()).toEqual(
      [...SOCIAL_POST_METRIC_KEYS].sort(),
    );
  });
});
