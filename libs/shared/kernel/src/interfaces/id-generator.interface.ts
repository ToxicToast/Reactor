import type { Id } from '../types/index.js';

export interface IdGenerator {
  generate<T extends string>(): Id<T>;
}
