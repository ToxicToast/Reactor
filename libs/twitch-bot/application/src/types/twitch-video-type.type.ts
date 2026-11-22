import type { TwitchVideoTypes } from '../constants/index.js';

export type TwitchVideoType =
  (typeof TwitchVideoTypes)[keyof typeof TwitchVideoTypes];
