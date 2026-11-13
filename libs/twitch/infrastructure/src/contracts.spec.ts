import {
  TwitchSessionEvents,
  TwitchStatsTopics,
  WebhookEvents as WebhookContractEvents,
  WebhookTopics,
  type TwitchSessionPayloadV1,
  type WebhookPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  WebhookEvents,
  type WebhookEventPayload,
} from '@toxictoast/shared-webhooks-domain';
import {
  StreamSessionEvents,
  type StreamSessionEventPayload,
} from '@toxictoast/twitch-domain';

describe('Event contracts', () => {
  it('match the serialized payload', () => {
    const checks: Array<true> = [
      true as Compatible<
        Jsonified<StreamSessionEventPayload>,
        TwitchSessionPayloadV1
      >,
      true as Compatible<Jsonified<WebhookEventPayload>, WebhookPayloadV1>,
    ];

    expect(checks).toHaveLength(2);
  });

  it('publish the session events under the contract topic and names', () => {
    expect(eventNamespacesOf(StreamSessionEvents)).toEqual([
      TwitchStatsTopics.SESSION,
    ]);
    expect(eventNamesOf(StreamSessionEvents)).toEqual(
      contractNamesOf(TwitchSessionEvents),
    );
  });

  it('publish the webhook events under the contract topic and names', () => {
    expect(eventNamespacesOf(WebhookEvents)).toEqual([WebhookTopics.WEBHOOK]);
    expect(eventNamesOf(WebhookEvents)).toEqual(
      contractNamesOf(WebhookContractEvents),
    );
  });
});
