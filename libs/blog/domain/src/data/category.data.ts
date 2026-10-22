import type { CategoryAnemic } from '../anemics/index.js';

export type CategoryData = Pick<
  CategoryAnemic,
  'title' | 'description' | 'parent_id'
>;
