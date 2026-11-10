import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  SecurityIpEvents,
  SecurityTopics,
  type IpBanPayloadV1,
} from '@toxictoast/contracts-events';
import {
  IpBanEvents,
  type IpBanEventPayload,
} from '@toxictoast/security-domain';

describe('Event contracts', () => {
  it('match the serialized payload', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<IpBanEventPayload>, IpBanPayloadV1>,
    ];

    expect(checks).toHaveLength(1);
  });

  it('publish the ip ban events under the contract topic and names', () => {
    expect(eventNamespacesOf(IpBanEvents)).toEqual([SecurityTopics.IP]);
    expect(eventNamesOf(IpBanEvents)).toEqual(
      contractNamesOf(SecurityIpEvents),
    );
  });
});
