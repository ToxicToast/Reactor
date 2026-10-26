import {
  InMemoryIpBanRepository,
  ipBanAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { ListBansUseCase } from './list-bans.usecase.js';

describe('ListBansUseCase', () => {
  let useCase: ListBansUseCase;

  beforeEach(async () => {
    const repository = new InMemoryIpBanRepository();
    await repository.save(ipBanAnemic('active'));
    await repository.save(
      ipBanAnemic('expired', {
        banned_until: new Date('2026-10-23T12:05:00Z'),
        created_at: new Date('2026-10-23T11:00:00Z'),
      }),
    );
    useCase = new ListBansUseCase(repository, { now: () => TEST_NOW });
  });

  it('lists only active bans when asked', async () => {
    const result = await useCase.execute({ active_only: true });

    expect(result.value.map((ban) => ban.id)).toEqual(['active']);
  });

  it('lists the whole history newest first', async () => {
    const result = await useCase.execute({ active_only: false });

    expect(result.value.map((ban) => ban.id)).toEqual(['active', 'expired']);
  });
});
