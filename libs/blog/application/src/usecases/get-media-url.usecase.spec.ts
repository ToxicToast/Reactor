import { InMemoryFileStorage } from '@toxictoast/shared-application';
import { MediaStatus, type MediaId } from '@toxictoast/blog-domain';
import {
  InMemoryMediaRepository,
  mediaAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { GetMediaUrlUseCase } from './get-media-url.usecase.js';

const ID = 'media-1' as MediaId;

describe('GetMediaUrlUseCase', () => {
  let repository: InMemoryMediaRepository;
  let useCase: GetMediaUrlUseCase;

  beforeEach(() => {
    repository = new InMemoryMediaRepository();
    useCase = new GetMediaUrlUseCase(
      repository,
      new InMemoryFileStorage(),
      600,
    );
  });

  it('returns a download url for ready media', async () => {
    await repository.save(
      mediaAnemic('media-1', { status: MediaStatus.READY }),
    );

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({
      url: 'https://storage.test/download/media/media-1.png',
      expires_in: 600,
    });
  });

  it('refuses pending media', async () => {
    await repository.save(mediaAnemic('media-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('treats deleted media as not found', async () => {
    await repository.save(
      mediaAnemic('media-1', {
        status: MediaStatus.READY,
        deleted_at: TEST_NOW,
      }),
    );

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
