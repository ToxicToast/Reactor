import {
  ObservationKinds,
  type ObservationKindValue,
} from '@toxictoast/twitch-domain';

export const LIVE_OBSERVATION_KINDS: ReadonlySet<ObservationKindValue> =
  new Set([
    ObservationKinds.STREAM_ONLINE,
    ObservationKinds.STREAM_OFFLINE,
    ObservationKinds.JOIN,
    ObservationKinds.LEAVE,
  ]);
