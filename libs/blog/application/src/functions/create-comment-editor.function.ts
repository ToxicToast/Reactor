import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  CommentAnemic,
  CommentDomain,
  CommentFactory,
  CommentRepository,
} from '@toxictoast/blog-domain';

export const createCommentEditor = (
  factory: CommentFactory,
  repository: CommentRepository,
  persistence: DomainPersistence,
): AggregateEditor<CommentAnemic, CommentDomain> => {
  return new AggregateEditor<CommentAnemic, CommentDomain>(
    'Comment',
    factory,
    repository,
    persistence,
  );
};
