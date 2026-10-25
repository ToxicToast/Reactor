import type { SecurityIpEvents, SecurityTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { IpBanPayloadV1 } from '../payloads/index.js';

export type IpBanEventV1 = EventEnvelope<
  typeof SecurityTopics.IP,
  (typeof SecurityIpEvents)[keyof typeof SecurityIpEvents],
  IpBanPayloadV1
>;
