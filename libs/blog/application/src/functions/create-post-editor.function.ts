import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  PostAnemic,
  PostDomain,
  PostFactory,
  PostRepository,
} from '@toxictoast/blog-domain';

export const createPostEditor = (
  factory: PostFactory,
  repository: PostRepository,
  persistence: DomainPersistence,
): AggregateEditor<PostAnemic, PostDomain> => {
  return new AggregateEditor<PostAnemic, PostDomain>(
    'Post',
    factory,
    repository,
    persistence,
  );
};
