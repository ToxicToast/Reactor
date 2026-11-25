import type { LinkAnemic } from '../anemics/index.js';

export type LinkData = Pick<LinkAnemic, 'target_url' | 'description'>;

export type LinkChanges = Pick<
  LinkAnemic,
  'target_url' | 'description' | 'active'
>;
