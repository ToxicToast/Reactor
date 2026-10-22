import { join } from 'node:path';

export const PROTO_ROOT = __dirname;

export const BLOG_PACKAGE = 'blog.v1';

export const BLOG_PROTO_FILES = [
  'blog/v1/tag.proto',
  'blog/v1/category.proto',
  'blog/v1/media.proto',
  'blog/v1/post.proto',
  'blog/v1/comment.proto',
].map((file) => join(PROTO_ROOT, file));
