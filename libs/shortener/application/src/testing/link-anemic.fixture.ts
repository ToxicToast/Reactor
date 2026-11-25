import type { LinkAnemic, LinkId } from '@toxictoast/shortener-domain';
import { TEST_NOW } from './test-domain-context.js';

export const linkAnemic = (
  id: string,
  overrides: Partial<LinkAnemic> = {},
): LinkAnemic => {
  return {
    id: id as LinkId,
    target_url: 'https://www.youtube.com/@ToxicToast',
    description: null,
    active: true,
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
