import { randomBytes } from 'node:crypto';
import { SecretCipher } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { EntitySchema, type DataSource } from 'typeorm';
import { SecretColumnRotator } from './secret-column-rotator.js';

interface ThingRow {
  id: string;
  url: string;
  token: Nullable<string>;
}

const ThingSchema = new EntitySchema<ThingRow>({
  name: 'Thing',
  tableName: 'things',
  columns: {
    id: { type: 'uuid', primary: true },
    url: { type: 'text' },
    token: { type: 'text', nullable: true },
  },
});

describe('SecretColumnRotator', () => {
  const k1 = randomBytes(32);
  const k2 = randomBytes(32);
  const oldCipher = SecretCipher.withSingleKey(k1, 'k1');
  const cipher = new SecretCipher({
    currentKeyId: 'k2',
    keys: new Map([
      ['k1', k1],
      ['k2', k2],
    ]),
  });

  let rows: Array<ThingRow>;
  let saved: Array<ThingRow>;
  let rotator: SecretColumnRotator<ThingRow>;

  beforeEach(() => {
    saved = [];
    const dataSource = {
      getRepository: () => ({
        find: async () => rows.map((row) => ({ ...row })),
        save: async (row: ThingRow) => {
          saved.push(row);
          return row;
        },
      }),
    } as unknown as DataSource;
    rotator = new SecretColumnRotator(
      dataSource,
      ThingSchema,
      ['url', 'token'],
      cipher,
    );
  });

  it('encrypts plaintext and re-encrypts old keys', async () => {
    rows = [
      { id: 'a', url: 'https://example.com/hook', token: null },
      { id: 'b', url: cipher.encrypt('x'), token: oldCipher.encrypt('t') },
    ];

    const rotated = await rotator.rotate();

    expect(rotated).toBe(2);
    expect(cipher.isCurrent(saved[0].url)).toBe(true);
    expect(cipher.decrypt(saved[0].url)).toBe('https://example.com/hook');
    expect(saved[0].token).toBeNull();
    expect(cipher.isCurrent(saved[1].token ?? '')).toBe(true);
    expect(cipher.decrypt(saved[1].token ?? '')).toBe('t');
  });

  it('leaves current rows untouched', async () => {
    rows = [{ id: 'a', url: cipher.encrypt('x'), token: cipher.encrypt('t') }];

    expect(await rotator.rotate()).toBe(0);
    expect(saved).toHaveLength(0);
  });

  it('names the table', () => {
    expect(rotator.table).toBe('things');
  });
});
