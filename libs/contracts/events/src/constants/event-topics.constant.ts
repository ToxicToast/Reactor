import { BlogTopics } from './blog-topics.constant.js';
import { SecurityTopics } from './security-topics.constant.js';
import { TwitchStatsTopics } from './twitch-stats-topics.constant.js';
import { TwitchTopics } from './twitch-topics.constant.js';

export const EVENT_TOPICS: ReadonlyArray<string> = [
  ...Object.values(BlogTopics),
  ...Object.values(SecurityTopics),
  ...Object.values(TwitchTopics),
  ...Object.values(TwitchStatsTopics),
];
