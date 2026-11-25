import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  LinkAnemic,
  LinkDomain,
  LinkFactory,
  LinkRepository,
} from '@toxictoast/shortener-domain';

export const createLinkEditor = (
  factory: LinkFactory,
  repository: LinkRepository,
  persistence: DomainPersistence,
): AggregateEditor<LinkAnemic, LinkDomain> => {
  return new AggregateEditor<LinkAnemic, LinkDomain>(
    'Link',
    factory,
    repository,
    persistence,
  );
};
