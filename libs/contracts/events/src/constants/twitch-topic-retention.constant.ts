import { TWITCH_EVENT_TOPICS } from './twitch-event-topics.constant.js';

const UNLIMITED = -1;

export const TWITCH_TOPIC_RETENTION_MS: Readonly<Record<string, number>> =
  Object.fromEntries(TWITCH_EVENT_TOPICS.map((topic) => [topic, UNLIMITED]));
