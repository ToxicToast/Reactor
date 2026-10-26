import { TwitchTopics } from './twitch-topics.constant.js';

const UNLIMITED = -1;

export const TWITCH_TOPIC_RETENTION_MS: Readonly<Record<string, number>> =
  Object.fromEntries(
    Object.values(TwitchTopics).map((topic) => [topic, UNLIMITED]),
  );
