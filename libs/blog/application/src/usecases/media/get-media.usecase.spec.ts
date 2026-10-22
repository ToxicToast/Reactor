import type { MediaId } from '@toxictoast/blog-domain';
import {
  InMemoryMediaRepository,
  mediaAnemic,
  TEST_NOW,
} from '../../testing/index.js';
import { GetMediaUseCase } from './get-media.usecase.js';

const ID = 'media-1' as MediaId;

describe('GetMediaUseCase', () => {
  let repository: InMemoryMediaRepository;
  let useCase: GetMediaUseCase;

  beforeEach(() => {
    repository = new InMemoryMediaRepository();
    useCase = new GetMediaUseCase(repository);
  });

  it('returns the media', async () => {
    await repository.save(mediaAnemic('media-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mediaAnemic('media-1'));
  });

  it('fails when the media does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('hides deleted media by default', async () => {
    await repository.save(mediaAnemic('media-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns deleted media with withDeleted', async () => {
    await repository.save(mediaAnemic('media-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, withDeleted: true });

    expect(result.isSuccess).toBe(true);
  });
});
