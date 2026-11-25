import { randomUUID } from 'node:crypto';
import type { LinkAnemic, LinkId } from '@toxictoast/shortener-domain';
import { ShortenerTestDatabase } from '../testing/index.js';
import { TypeOrmLinkRepository } from './typeorm-link.repository.js';

const NOW = new Date('2026-11-25T10:00:00Z');

const link = (overrides: Partial<LinkAnemic> = {}): LinkAnemic => {
  return {
    id: randomUUID() as LinkId,
    target_url: 'https://www.youtube.com/@ToxicToast',
    description: null,
    active: true,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('TypeOrmLinkRepository', () => {
  const database = new ShortenerTestDatabase();
  let links: TypeOrmLinkRepository;

  beforeAll(async () => {
    await database.start();
    links = new TypeOrmLinkRepository(database.dataSource, database.context);
  });

  afterEach(() => database.truncate());

  afterAll(() => database.stop());

  it('saves and loads a link', async () => {
    const anemic = link({ description: 'YouTube' });

    await links.save(anemic);

    expect(await links.findById(anemic.id)).toEqual(anemic);
  });

  it('updates an existing link on save', async () => {
    const anemic = link();
    await links.save(anemic);

    await links.save({ ...anemic, active: false, updated_at: NOW });

    expect((await links.findById(anemic.id))?.active).toBe(false);
    expect(await links.findList()).toHaveLength(1);
  });

  it('hides deleted links unless asked for', async () => {
    const anemic = link({ deleted_at: NOW });
    await links.save(anemic);

    expect(await links.findById(anemic.id)).toBeNull();
    expect(await links.findById(anemic.id, true)).toEqual(anemic);
  });

  it('keeps long target urls intact', async () => {
    const anemic = link({
      target_url: `https://example.com/${'a'.repeat(1900)}`,
    });

    await links.save(anemic);

    expect((await links.findById(anemic.id))?.target_url).toBe(
      anemic.target_url,
    );
  });
});
