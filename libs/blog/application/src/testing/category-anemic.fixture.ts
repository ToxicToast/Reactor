import type { CategoryAnemic, CategoryId } from '@toxictoast/blog-domain';
import { TEST_NOW } from './test-domain-context.js';

export const categoryAnemic = (
  id: string,
  overrides: Partial<CategoryAnemic> = {},
): CategoryAnemic => {
  return {
    id: id as CategoryId,
    title: id,
    slug: id,
    description: null,
    parent_id: null,
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
