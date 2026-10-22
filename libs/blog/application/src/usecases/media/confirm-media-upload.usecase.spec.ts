import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryFileStorage,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  MediaFactory,
  MediaStatus,
  type MediaId,
} from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryMediaRepository,
  mediaAnemic,
} from '../../testing/index.js';
import { ConfirmMediaUploadUseCase } from './confirm-media-upload.usecase.js';

const ID = 'media-1' as MediaId;

describe('ConfirmMediaUploadUseCase', () => {
  let repository: InMemoryMediaRepository;
  let storage: InMemoryFileStorage;
  let outbox: InMemoryOutbox;
  let useCase: ConfirmMediaUploadUseCase;

  beforeEach(async () => {
    repository = new InMemoryMediaRepository();
    storage = new InMemoryFileStorage();
    outbox = new InMemoryOutbox();
    useCase = new ConfirmMediaUploadUseCase(
      new MediaFactory(createTestContext()),
      repository,
      storage,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );

    await repository.save(mediaAnemic('media-1'));
  });

  it('marks the media ready with the real size from storage', async () => {
    storage.upload('media/media-1.png', { size: 4096, mime_type: 'image/png' });

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      status: MediaStatus.READY,
      size: 4096,
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['ready']);
  });

  it('fails when the file has not been uploaded', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('refuses a file with a different type', async () => {
    storage.upload('media/media-1.png', {
      size: 4096,
      mime_type: 'application/pdf',
    });

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(repository.items.get(ID)?.status).toBe(MediaStatus.PENDING);
  });

  it('refuses a file above the size limit', async () => {
    storage.upload('media/media-1.png', {
      size: 11 * 1024 * 1024,
      mime_type: 'image/png',
    });

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });

  it('refuses confirming twice', async () => {
    storage.upload('media/media-1.png', { size: 4096, mime_type: 'image/png' });
    await useCase.execute({ id: ID });

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails when the media does not exist', async () => {
    const result = await useCase.execute({ id: 'missing' as MediaId });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
