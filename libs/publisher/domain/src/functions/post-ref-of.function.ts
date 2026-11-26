import type { PostRef } from '../interfaces/index.js';

export const postRefOf = (post: PostRef): PostRef => {
  return { platform: post.platform, remote_id: post.remote_id };
};
