import { MediaStatus, type MediaAnemic } from '@toxictoast/blog-domain';
import {
  InMemoryMediaRepository,
  mediaAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { ListMediaUseCase } from './list-media.usecase.js';

describe('ListMediaUseCase', () => {
  let repository: InMemoryMediaRepository;
  let useCase: ListMediaUseCase;

  beforeEach(async () => {
    repository = new InMemoryMediaRepository();
    useCase = new ListMediaUseCase(repository);

    await repository.save(mediaAnemic('m-1', { status: MediaStatus.READY }));
    await repository.save(mediaAnemic('m-2'));
    await repository.save(
      mediaAnemic('m-3', { status: MediaStatus.READY, deleted_at: TEST_NOW }),
    );
  });

  const ids = (media: Array<MediaAnemic>): Array<string> => {
    return media.map((item) => item.id);
  };

  it('returns all media without deleted ones', async () => {
    const result = await useCase.execute({});

    expect(ids(result.value)).toEqual(['m-1', 'm-2']);
  });

  it('filters by status', async () => {
    const result = await useCase.execute({ status: MediaStatus.READY });

    expect(ids(result.value)).toEqual(['m-1']);
  });

  it('includes deleted media with withDeleted', async () => {
    const result = await useCase.execute({ withDeleted: true });

    expect(ids(result.value)).toEqual(['m-1', 'm-2', 'm-3']);
  });
});
