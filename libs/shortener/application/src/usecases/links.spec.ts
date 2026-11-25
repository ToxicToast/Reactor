import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  LinkEvents,
  LinkFactory,
  type LinkId,
} from '@toxictoast/shortener-domain';
import {
  createTestContext,
  InMemoryLinkRepository,
  linkAnemic,
} from '../testing/index.js';
import { CreateLinkUseCase } from './create-link.usecase.js';
import { DeleteLinkUseCase } from './delete-link.usecase.js';
import { ResolveLinkUseCase } from './resolve-link.usecase.js';
import { RestoreLinkUseCase } from './restore-link.usecase.js';
import { UpdateLinkUseCase } from './update-link.usecase.js';

const LINK_ID = 'link-1' as LinkId;

describe('Links', () => {
  let repository: InMemoryLinkRepository;
  let outbox: InMemoryOutbox;
  let factory: LinkFactory;
  let persistence: DomainPersistence;

  beforeEach(() => {
    repository = new InMemoryLinkRepository();
    outbox = new InMemoryOutbox();
    factory = new LinkFactory(createTestContext());
    persistence = new DomainPersistence(outbox, new ImmediateUnitOfWork());
  });

  it('creates a link and announces it', async () => {
    const result = await new CreateLinkUseCase(
      factory,
      repository,
      persistence,
    ).execute({
      target_url: 'https://www.youtube.com/@ToxicToast',
      description: 'YouTube',
    });

    expect(result.value).toMatchObject({
      target_url: 'https://www.youtube.com/@ToxicToast',
      description: 'YouTube',
      active: true,
    });
    expect(outbox.events.map((event) => event.event_name)).toEqual([
      LinkEvents.CREATED.name,
    ]);
  });

  it('resolves an active link', async () => {
    await repository.save(linkAnemic(LINK_ID));

    const result = await new ResolveLinkUseCase(factory, repository).execute({
      id: LINK_ID,
    });

    expect(result.value).toEqual({
      target_url: 'https://www.youtube.com/@ToxicToast',
    });
  });

  it('does not resolve a deactivated link', async () => {
    await repository.save(linkAnemic(LINK_ID));
    await new UpdateLinkUseCase(factory, repository, persistence).execute({
      id: LINK_ID,
      target_url: 'https://www.youtube.com/@ToxicToast',
      description: null,
      active: false,
    });

    const result = await new ResolveLinkUseCase(factory, repository).execute({
      id: LINK_ID,
    });

    expect(result.isFailure).toBe(true);
  });

  it('resolves a deleted link again after a restore', async () => {
    await repository.save(linkAnemic(LINK_ID));
    const resolve = new ResolveLinkUseCase(factory, repository);
    await new DeleteLinkUseCase(factory, repository, persistence).execute({
      id: LINK_ID,
    });

    expect((await resolve.execute({ id: LINK_ID })).isFailure).toBe(true);

    await new RestoreLinkUseCase(factory, repository, persistence).execute({
      id: LINK_ID,
    });

    expect((await resolve.execute({ id: LINK_ID })).isSuccess).toBe(true);
  });
});
