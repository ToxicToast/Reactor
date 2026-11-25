import type { LinkId, RawClick } from '@toxictoast/shortener-domain';
import { TEST_NOW } from './test-domain-context.js';

export const rawClick = (
  eventId: string,
  overrides: Partial<RawClick> = {},
): RawClick => {
  return {
    event_id: eventId,
    link_id: 'link-1' as LinkId,
    clicked_at: TEST_NOW,
    referer: 'https://www.youtube.com/',
    user_agent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    country: null,
    ...overrides,
  };
};
