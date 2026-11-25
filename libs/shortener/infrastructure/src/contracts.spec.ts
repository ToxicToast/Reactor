import {
  ShortenerLinkEvents,
  ShortenerTopics,
  type ShortenerLinkPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  LinkEvents,
  type LinkEventPayload,
} from '@toxictoast/shortener-domain';

describe('Event contracts', () => {
  it('match the serialized payload', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<LinkEventPayload>, ShortenerLinkPayloadV1>,
    ];

    expect(checks).toHaveLength(1);
  });

  it('publish the link events under the contract topic and names', () => {
    expect(eventNamespacesOf(LinkEvents)).toEqual([ShortenerTopics.LINK]);
    expect(eventNamesOf(LinkEvents)).toEqual(
      contractNamesOf(ShortenerLinkEvents),
    );
  });
});
