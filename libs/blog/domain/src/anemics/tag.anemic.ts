import type { Anemic } from '@toxictoast/shared-kernel';
import type { TagId } from '../types/index.js';

export interface TagAnemic extends Anemic<TagId> {
  readonly title: string;
  readonly slug: string;
}
