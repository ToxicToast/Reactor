import { BlogTopics } from './blog-topics.constant.js';
import { SecurityTopics } from './security-topics.constant.js';

export const EVENT_TOPICS: ReadonlyArray<string> = [
  ...Object.values(BlogTopics),
  ...Object.values(SecurityTopics),
];
