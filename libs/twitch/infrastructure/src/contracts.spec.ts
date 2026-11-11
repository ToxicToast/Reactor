import {
  TwitchSessionEvents,
  TwitchStatsTopics,
  type TwitchSessionPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
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
    ];

    expect(checks).toHaveLength(1);
  });

  it('publish the session events under the contract topic and names', () => {
    expect(eventNamespacesOf(StreamSessionEvents)).toEqual([
      TwitchStatsTopics.SESSION,
    ]);
    expect(eventNamesOf(StreamSessionEvents)).toEqual(
      contractNamesOf(TwitchSessionEvents),
    );
  });
});
