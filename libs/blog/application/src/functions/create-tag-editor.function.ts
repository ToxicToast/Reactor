import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagDomain,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';

export const createTagEditor = (
  factory: TagFactory,
  repository: TagRepository,
  persistence: DomainPersistence,
): AggregateEditor<TagAnemic, TagDomain> => {
  return new AggregateEditor<TagAnemic, TagDomain>(
    'Tag',
    factory,
    repository,
    persistence,
  );
};
