import { TWITCH_TEST_CHANNEL } from '@toxictoast/twitch-application';
import type { IncomingTwitchEvent } from '../interfaces/index.js';

export const TEST_VIEWER = {
  user_id: '42',
  user_login: 'viewer',
  user_name: 'Viewer',
};

export const incomingTwitchEvent = (
  topic: string,
  name: string,
  payload: object = {},
): IncomingTwitchEvent => {
  return {
    event_id: `${topic}.${name}-1`,
    event_namespace: topic,
    event_name: name,
    occurred_at: '2026-10-28T20:00:00.000Z',
    payload: { ...TWITCH_TEST_CHANNEL, ...payload },
  };
};
