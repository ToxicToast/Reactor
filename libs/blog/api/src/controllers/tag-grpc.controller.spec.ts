import { randomUUID } from 'node:crypto';
import { status } from '@grpc/grpc-js';
import {
  CreateTagUseCase,
  DeleteTagUseCase,
  GetTagUseCase,
  InMemoryTagRepository,
  ListTagsUseCase,
  RestoreTagUseCase,
  UpdateTagUseCase,
} from '@toxictoast/blog-application';
import { TagFactory } from '@toxictoast/blog-domain';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { grpcCode } from '@toxictoast/shared-grpc';
import { TagGrpcController } from './tag-grpc.controller.js';

const NOW = new Date('2026-10-20T12:00:00Z');
const NOW_ISO = '2026-10-20T12:00:00.000Z';

describe('TagGrpcController', () => {
  let controller: TagGrpcController;

  beforeEach(() => {
    const factory = new TagFactory(createUuidTestContext(NOW));
    const tags = new InMemoryTagRepository();
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    controller = new TagGrpcController(
      new CreateTagUseCase(factory, tags, persistence),
      new UpdateTagUseCase(factory, tags, persistence),
      new DeleteTagUseCase(factory, tags, persistence),
      new RestoreTagUseCase(factory, tags, persistence),
      new GetTagUseCase(tags),
      new ListTagsUseCase(tags),
    );
  });

  it('creates a tag and maps it to proto', async () => {
    const { tag } = await controller.createTag({ title: 'Warhammer 40k' });

    expect(tag).toEqual({
      id: expect.any(String),
      title: 'Warhammer 40k',
      slug: 'warhammer-40k',
      created_at: NOW_ISO,
      updated_at: undefined,
      deleted_at: undefined,
    });
  });

  it('updates, deletes and restores a tag', async () => {
    const { tag } = await controller.createTag({ title: 'Warhammer' });
    const id = tag?.id ?? '';

    const updated = await controller.updateTag({ id, title: 'Neu' });
    const deleted = await controller.deleteTag({ id });
    const restored = await controller.restoreTag({ id });

    expect(updated.tag?.title).toBe('Neu');
    expect(deleted.tag?.deleted_at).toBe(NOW_ISO);
    expect(restored.tag?.deleted_at).toBeUndefined();
  });

  it('gets deleted tags only with with_deleted', async () => {
    const { tag } = await controller.createTag({ title: 'Warhammer' });
    const id = tag?.id ?? '';
    await controller.deleteTag({ id });

    expect(await grpcCode(controller.getTag({ id, with_deleted: false }))).toBe(
      status.NOT_FOUND,
    );
    expect((await controller.getTag({ id, with_deleted: true })).tag?.id).toBe(
      id,
    );
  });

  it('lists tags with paging', async () => {
    await controller.createTag({ title: 'Eins' });
    await controller.createTag({ title: 'Zwei' });

    const { tags } = await controller.listTags({
      limit: 1,
      offset: 1,
      with_deleted: false,
    });

    expect(tags).toHaveLength(1);
  });

  it('maps a missing tag to NOT_FOUND', async () => {
    const call = controller.getTag({ id: randomUUID(), with_deleted: false });

    expect(await grpcCode(call)).toBe(status.NOT_FOUND);
  });

  it('maps an invalid id to INVALID_ARGUMENT', async () => {
    const call = controller.getTag({ id: 'abc', with_deleted: false });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps a validation error to INVALID_ARGUMENT', async () => {
    expect(await grpcCode(controller.createTag({ title: '   ' }))).toBe(
      status.INVALID_ARGUMENT,
    );
  });

  it('maps a duplicate slug to FAILED_PRECONDITION', async () => {
    await controller.createTag({ title: 'Warhammer' });

    expect(await grpcCode(controller.createTag({ title: 'Warhammer' }))).toBe(
      status.FAILED_PRECONDITION,
    );
  });
});
