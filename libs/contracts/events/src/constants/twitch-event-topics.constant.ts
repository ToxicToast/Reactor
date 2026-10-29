import { TwitchStatsTopics } from './twitch-stats-topics.constant.js';
import { TwitchTopics } from './twitch-topics.constant.js';

export const TWITCH_EVENT_TOPICS: ReadonlyArray<string> = [
  ...Object.values(TwitchTopics),
  ...Object.values(TwitchStatsTopics),
];
