import { join } from 'node:path';

export const PROTO_ROOT = __dirname;

/* --------------------- */

export const BLOG_PACKAGE = 'blog.v1';

export const BLOG_PROTO_FILES = [
  'blog/v1/tag.proto',
  'blog/v1/category.proto',
  'blog/v1/media.proto',
  'blog/v1/post.proto',
  'blog/v1/comment.proto',
].map((file) => join(PROTO_ROOT, file));

/* --------------------- */

export const SECURITY_PACKAGE = 'security.v1';

export const SECURITY_PROTO_FILES = ['security/v1/ban.proto'].map((file) =>
  join(PROTO_ROOT, file),
);

/* --------------------- */

export const AUDIT_PACKAGE = 'audit.v1';

export const AUDIT_PROTO_FILES = ['audit/v1/audit.proto'].map((file) =>
  join(PROTO_ROOT, file),
);
