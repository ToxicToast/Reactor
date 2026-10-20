import type { Clock } from '@toxictoast/shared-kernel';
import { UuidV7Generator } from './uuid-v7-generator.js';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const clockAt = (iso: string): Clock => {
  return { now: () => new Date(iso) };
};

describe('UuidV7Generator', () => {
  it('generates a valid version 7 uuid', () => {
    const generator = new UuidV7Generator(clockAt('2026-10-20T12:00:00Z'));

    expect(generator.generate()).toMatch(UUID_V7);
  });

  it('encodes the timestamp in the first 48 bits', () => {
    const now = new Date('2026-10-20T12:00:00.123Z');
    const generator = new UuidV7Generator({ now: () => now });

    const id = generator.generate();
    const timestamp = parseInt(id.replace(/-/g, '').slice(0, 12), 16);

    expect(timestamp).toBe(now.getTime());
  });

  it('sorts by time', () => {
    const earlier = new UuidV7Generator(clockAt('2026-10-20T12:00:00Z'));
    const later = new UuidV7Generator(clockAt('2026-10-20T12:00:01Z'));

    expect(earlier.generate() < later.generate()).toBe(true);
  });

  it('generates unique ids within the same millisecond', () => {
    const generator = new UuidV7Generator(clockAt('2026-10-20T12:00:00Z'));

    const ids = new Set(
      Array.from({ length: 1000 }, () => generator.generate()),
    );

    expect(ids.size).toBe(1000);
  });
});
