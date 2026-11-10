import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaDomain,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';

export const createMediaEditor = (
  factory: MediaFactory,
  repository: MediaRepository,
  persistence: DomainPersistence,
): AggregateEditor<MediaAnemic, MediaDomain> => {
  return new AggregateEditor<MediaAnemic, MediaDomain>(
    'Media',
    factory,
    repository,
    persistence,
  );
};
