import type { Clock } from '@toxictoast/shared-kernel';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
