export const PostStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
