import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryFileStorage,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { MediaFactory, MediaStatus } from '@toxictoast/blog-domain';
import {
  createTestContext,
  InMemoryMediaRepository,
} from '../../testing/index.js';
import { RequestMediaUploadUseCase } from './request-media-upload.usecase.js';

describe('RequestMediaUploadUseCase', () => {
  let repository: InMemoryMediaRepository;
  let outbox: InMemoryOutbox;
  let useCase: RequestMediaUploadUseCase;

  beforeEach(() => {
    repository = new InMemoryMediaRepository();
    outbox = new InMemoryOutbox();
    useCase = new RequestMediaUploadUseCase(
      new MediaFactory(createTestContext()),
      repository,
      new InMemoryFileStorage(),
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
    );
  });

  it('creates pending media and returns an upload url', async () => {
    const result = await useCase.execute({
      filename: 'hero.png',
      mime_type: 'image/png',
      size: 2048,
      alt_text: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.media.status).toBe(MediaStatus.PENDING);
    expect(result.value.upload_url).toBe(
      `https://storage.test/upload/${result.value.media.object_key}`,
    );
    expect(repository.items.size).toBe(1);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['create']);
  });

  it('fails on a disallowed type without storing anything', async () => {
    const result = await useCase.execute({
      filename: 'doc.pdf',
      mime_type: 'application/pdf',
      size: 2048,
      alt_text: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(repository.items.size).toBe(0);
  });
});
