import type { SessionStatus } from '../interfaces/index.js';

export const EMPTY_SESSION_STATUS: SessionStatus = {
  title: null,
  game_id: null,
  game_name: null,
  viewer_count: 0,
  peak_viewers: 0,
  viewer_samples: 0,
  viewer_sum: 0,
};
