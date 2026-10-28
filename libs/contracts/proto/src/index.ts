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

/* --------------------- */

export const TWITCH_BOT_PACKAGE = 'twitch_bot.v1';

export const TWITCH_BOT_PROTO_FILES = ['twitch_bot/v1/twitch_bot.proto'].map(
  (file) => join(PROTO_ROOT, file),
);

/* --------------------- */

export const TWITCH_PACKAGE = 'twitch.v1';

export const TWITCH_PROTO_FILES = ['twitch/v1/twitch.proto'].map((file) =>
  join(PROTO_ROOT, file),
);
