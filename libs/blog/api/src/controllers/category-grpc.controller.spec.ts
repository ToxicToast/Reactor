import { randomUUID } from 'node:crypto';
import { status } from '@grpc/grpc-js';
import {
  CategoryHierarchyService,
  ChangeCategoryParentUseCase,
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoryUseCase,
  InMemoryCategoryRepository,
  ListCategoriesUseCase,
  RestoreCategoryUseCase,
  UpdateCategoryUseCase,
} from '@toxictoast/blog-application';
import { CategoryFactory } from '@toxictoast/blog-domain';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { grpcCode } from '@toxictoast/shared-grpc';
import { CategoryGrpcController } from './category-grpc.controller.js';

const NOW = new Date('2026-10-20T12:00:00Z');

describe('CategoryGrpcController', () => {
  let controller: CategoryGrpcController;

  beforeEach(() => {
    const factory = new CategoryFactory(createUuidTestContext(NOW));
    const categories = new InMemoryCategoryRepository();
    const hierarchy = new CategoryHierarchyService(categories);
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    controller = new CategoryGrpcController(
      new CreateCategoryUseCase(factory, categories, hierarchy, persistence),
      new UpdateCategoryUseCase(factory, categories, persistence),
      new ChangeCategoryParentUseCase(
        factory,
        categories,
        hierarchy,
        persistence,
      ),
      new DeleteCategoryUseCase(factory, categories, persistence),
      new RestoreCategoryUseCase(factory, categories, persistence),
      new GetCategoryUseCase(categories),
      new ListCategoriesUseCase(categories),
    );
  });

  const create = async (title: string, parent_id?: string): Promise<string> => {
    const { category } = await controller.createCategory({ title, parent_id });
    return category?.id ?? '';
  };

  it('creates a child category with description', async () => {
    const parent = await create('Warhammer');

    const { category } = await controller.createCategory({
      title: 'Space Marines',
      description: 'Die Engel des Todes',
      parent_id: parent,
    });

    expect(category).toMatchObject({
      slug: 'space-marines',
      description: 'Die Engel des Todes',
      parent_id: parent,
    });
  });

  it('maps a missing description and parent to undefined', async () => {
    const { category } = await controller.createCategory({ title: 'Lore' });

    expect(category?.description).toBeUndefined();
    expect(category?.parent_id).toBeUndefined();
  });

  it('clears the description when it is left out on update', async () => {
    const { category } = await controller.createCategory({
      title: 'Lore',
      description: 'Alt',
    });

    const updated = await controller.updateCategory({
      id: category?.id ?? '',
      title: 'Lore',
    });

    expect(updated.category?.description).toBeUndefined();
  });

  it('moves a category to the root', async () => {
    const parent = await create('Warhammer');
    const child = await create('Orks', parent);

    const { category } = await controller.changeCategoryParent({ id: child });

    expect(category?.parent_id).toBeUndefined();
  });

  it('maps an invalid parent id to INVALID_ARGUMENT', async () => {
    const call = controller.createCategory({ title: 'Orks', parent_id: 'abc' });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps an unknown parent to NOT_FOUND', async () => {
    const call = controller.createCategory({
      title: 'Orks',
      parent_id: randomUUID(),
    });

    expect(await grpcCode(call)).toBe(status.NOT_FOUND);
  });

  it('maps deleting a category with children to FAILED_PRECONDITION', async () => {
    const parent = await create('Warhammer');
    await create('Orks', parent);

    expect(await grpcCode(controller.deleteCategory({ id: parent }))).toBe(
      status.FAILED_PRECONDITION,
    );
  });

  it('lists categories', async () => {
    await create('Eins');
    await create('Zwei');

    const { categories } = await controller.listCategories({
      with_deleted: false,
    });

    expect(categories).toHaveLength(2);
  });
});
