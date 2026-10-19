import type { IdGenerator } from './id-generator.interface.js';
import { Clock } from './clock.interface.js';

export interface DomainContext {
  readonly id: IdGenerator;
  readonly date: Clock;
}
