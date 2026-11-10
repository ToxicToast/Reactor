import {
  TwitchBotEvents,
  TwitchTopics,
  type TwitchBotChannelPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type Jsonified,
} from '@toxictoast/contracts-events/testing';
import {
  TwitchChannelEvents,
  type TwitchChannelEventPayload,
} from '@toxictoast/twitch-bot-domain';

describe('Event contracts', () => {
  it('match the serialized payload', () => {
    const checks: Array<true> = [
      true as Compatible<
        Jsonified<TwitchChannelEventPayload>,
        TwitchBotChannelPayloadV1
      >,
    ];

    expect(checks).toHaveLength(1);
  });

  it('publish the channel events under the contract topic and names', () => {
    expect(eventNamespacesOf(TwitchChannelEvents)).toEqual([TwitchTopics.BOT]);
    expect(eventNamesOf(TwitchChannelEvents)).toEqual(
      contractNamesOf(TwitchBotEvents),
    );
  });
});
