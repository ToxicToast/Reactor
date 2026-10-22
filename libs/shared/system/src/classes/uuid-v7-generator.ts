import { randomBytes } from 'node:crypto';
import type { Clock, Id, IdGenerator } from '@toxictoast/shared-kernel';

export class UuidV7Generator implements IdGenerator {
  constructor(private readonly clock: Clock) {}

  generate<T extends string>(): Id<T> {
    const bytes = randomBytes(16);

    let timestamp = this.clock.now().getTime();
    for (let index = 5; index >= 0; index--) {
      bytes[index] = timestamp % 256;
      timestamp = Math.floor(timestamp / 256);
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString('hex');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join('-') as Id<T>;
  }
}
