import {
  AggregateEditor,
  type DomainPersistence,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryDomain,
  CategoryFactory,
  CategoryRepository,
} from '@toxictoast/blog-domain';

export const createCategoryEditor = (
  factory: CategoryFactory,
  repository: CategoryRepository,
  persistence: DomainPersistence,
): AggregateEditor<CategoryAnemic, CategoryDomain> => {
  return new AggregateEditor<CategoryAnemic, CategoryDomain>(
    'Category',
    factory,
    repository,
    persistence,
  );
};
