import type { DomainContext } from '../interfaces/index.js';

export const createFixedTestContext = (
  id: string,
  clock: () => Date,
): DomainContext => {
  return {
    id: { generate: () => id as never },
    date: { now: clock },
  };
};
