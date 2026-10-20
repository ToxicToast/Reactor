import type { Nullable } from '@toxictoast/shared-types';
import type { AnemicRow } from '@toxictoast/shared-persistence';

export interface PostRow extends AnemicRow {
  author_id: string;
  title: string;
  slug: string;
  excerpt: Nullable<string>;
  content: string;
  status: string;
  featured: boolean;
  reading_time: number;
  blog_image_id: Nullable<string>;
  hero_image_id: Nullable<string>;
  published_at: Nullable<Date>;
}
