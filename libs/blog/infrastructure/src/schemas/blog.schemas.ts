import { OutboxSchema } from '@toxictoast/shared-persistence';
import { CategorySchema } from './category.schema.js';
import { CommentSchema } from './comment.schema.js';
import { MediaSchema } from './media.schema.js';
import { PostCategorySchema } from './post-category.schema.js';
import { PostTagSchema } from './post-tag.schema.js';
import { PostSchema } from './post.schema.js';
import { TagSchema } from './tag.schema.js';

export const blogSchemas = [
  TagSchema,
  CategorySchema,
  MediaSchema,
  PostSchema,
  PostCategorySchema,
  PostTagSchema,
  CommentSchema,
  OutboxSchema,
];
