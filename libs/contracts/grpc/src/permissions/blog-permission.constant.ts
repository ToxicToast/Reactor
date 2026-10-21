export const BlogPermission = {
  POST_WRITE: 'blog.post.write',
  POST_DELETE: 'blog.post.delete',
  CATEGORY_WRITE: 'blog.category.write',
  CATEGORY_DELETE: 'blog.category.delete',
  TAG_WRITE: 'blog.tag.write',
  TAG_DELETE: 'blog.tag.delete',
  MEDIA_WRITE: 'blog.media.write',
  MEDIA_DELETE: 'blog.media.delete',
  COMMENT_WRITE: 'blog.comment.write',
  COMMENT_MODERATE: 'blog.comment.moderate',
  COMMENT_DELETE: 'blog.comment.delete',
} as const;
