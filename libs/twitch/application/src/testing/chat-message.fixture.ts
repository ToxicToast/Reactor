import type { PostedChatMessage } from '../types/index.js';
import { TWITCH_TEST_CHANNEL, TWITCH_TEST_NOW } from './test-context.js';
import { viewer } from './observation.fixture.js';

export const postedChatMessage = (
  id: string,
  overrides: Partial<PostedChatMessage> = {},
): PostedChatMessage => {
  return {
    message_id: id,
    channel_id: TWITCH_TEST_CHANNEL.channel_id,
    ...viewer('1'),
    text: `message ${id}`,
    color: null,
    badges: [],
    bits: 0,
    reply_to_message_id: null,
    sent_at: TWITCH_TEST_NOW,
    ...overrides,
  };
};
