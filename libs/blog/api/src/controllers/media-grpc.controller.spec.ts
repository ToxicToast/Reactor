import { status } from '@grpc/grpc-js';
import {
  ConfirmMediaUploadUseCase,
  DeleteMediaUseCase,
  GetMediaUrlUseCase,
  GetMediaUseCase,
  InMemoryMediaRepository,
  ListMediaUseCase,
  RequestMediaUploadUseCase,
  RestoreMediaUseCase,
  UpdateMediaAltTextUseCase,
} from '@toxictoast/blog-application';
import { MediaFactory } from '@toxictoast/blog-domain';
import {
  BlogPermission,
  MediaStatus as GrpcMediaStatus,
} from '@toxictoast/contracts-grpc';
import {
  createUuidTestContext,
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryFileStorage,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  anonymousTestActor,
  grpcCode,
  testActor,
  TestActorProvider,
} from '@toxictoast/shared-grpc';
import { MediaGrpcController } from './media-grpc.controller.js';

const NOW = new Date('2026-10-20T12:00:00Z');

describe('MediaGrpcController', () => {
  let storage: InMemoryFileStorage;
  let controller: MediaGrpcController;
  let actors: TestActorProvider;

  beforeEach(() => {
    actors = new TestActorProvider(
      testActor([BlogPermission.MEDIA_WRITE, BlogPermission.MEDIA_DELETE]),
    );
    const factory = new MediaFactory(createUuidTestContext(NOW));
    const media = new InMemoryMediaRepository();
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    storage = new InMemoryFileStorage();
    controller = new MediaGrpcController(
      new RequestMediaUploadUseCase(factory, media, storage, persistence),
      new ConfirmMediaUploadUseCase(factory, media, storage, persistence),
      new UpdateMediaAltTextUseCase(factory, media, persistence),
      new DeleteMediaUseCase(factory, media, persistence),
      new RestoreMediaUseCase(factory, media, persistence),
      new GetMediaUseCase(media),
      new GetMediaUrlUseCase(media, storage),
      new ListMediaUseCase(media),
      actors,
    );
  });

  const requestUpload = () => {
    return controller.requestMediaUpload({
      filename: 'hero.png',
      mime_type: 'image/png',
      size: 1024,
      alt_text: 'Ein Space Marine',
    });
  };

  it('requests an upload and returns the upload url', async () => {
    const { media, upload_url } = await requestUpload();

    expect(media).toMatchObject({
      filename: 'hero.png',
      alt_text: 'Ein Space Marine',
      status: GrpcMediaStatus.MEDIA_STATUS_PENDING,
    });
    expect(upload_url).toContain(media?.object_key);
  });

  it('confirms an upload and returns a download url', async () => {
    const { media } = await requestUpload();
    storage.upload(media?.object_key ?? '', {
      size: 1024,
      mime_type: 'image/png',
    });

    const confirmed = await controller.confirmMediaUpload({
      id: media?.id ?? '',
    });
    const url = await controller.getMediaUrl({ id: media?.id ?? '' });

    expect(confirmed.media?.status).toBe(GrpcMediaStatus.MEDIA_STATUS_READY);
    expect(url.url).toContain(media?.object_key);
    expect(url.expires_in).toBeGreaterThan(0);
  });

  it('clears the alt text when it is left out', async () => {
    const { media } = await requestUpload();

    const updated = await controller.updateMediaAltText({
      id: media?.id ?? '',
    });

    expect(updated.media?.alt_text).toBeUndefined();
  });

  it('filters the list by status', async () => {
    await requestUpload();

    const pending = await controller.listMedia({
      status: GrpcMediaStatus.MEDIA_STATUS_PENDING,
      with_deleted: false,
    });
    const ready = await controller.listMedia({
      status: GrpcMediaStatus.MEDIA_STATUS_READY,
      with_deleted: false,
    });

    expect(pending.media).toHaveLength(1);
    expect(ready.media).toHaveLength(0);
  });

  it('maps an unspecified status filter to INVALID_ARGUMENT', async () => {
    const call = controller.listMedia({
      status: GrpcMediaStatus.MEDIA_STATUS_UNSPECIFIED,
      with_deleted: false,
    });

    expect(await grpcCode(call)).toBe(status.INVALID_ARGUMENT);
  });

  it('maps confirming a missing upload to its domain error', async () => {
    const { media } = await requestUpload();

    const call = controller.confirmMediaUpload({ id: media?.id ?? '' });

    expect(await grpcCode(call)).not.toBeUndefined();
  });

  it('keeps the media library behind the write permission', async () => {
    actors.actor = anonymousTestActor();

    expect(await grpcCode(requestUpload())).toBe(status.UNAUTHENTICATED);
    expect(await grpcCode(controller.listMedia({ with_deleted: false }))).toBe(
      status.UNAUTHENTICATED,
    );
  });

  it('serves download urls of ready media publicly', async () => {
    const { media } = await requestUpload();
    storage.upload(media?.object_key ?? '', {
      size: 1024,
      mime_type: 'image/png',
    });
    await controller.confirmMediaUpload({ id: media?.id ?? '' });
    actors.actor = anonymousTestActor();

    const url = await controller.getMediaUrl({ id: media?.id ?? '' });

    expect(url.url).toContain(media?.object_key);
  });

  it('requires the delete permission to delete media', async () => {
    const { media } = await requestUpload();
    actors.actor = testActor([BlogPermission.MEDIA_WRITE]);

    const call = controller.deleteMedia({ id: media?.id ?? '' });

    expect(await grpcCode(call)).toBe(status.PERMISSION_DENIED);
  });
});
