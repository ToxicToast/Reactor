import { Platforms } from '../constants/index.js';
import type { Platform } from '../types/index.js';

export const isPlatform = (value: string): value is Platform => {
  return (Object.values(Platforms) as ReadonlyArray<string>).includes(value);
};
