import type { AdvisoryLock } from '@toxictoast/shared-persistence';
import type { EntityManager } from 'typeorm';

export const immediateAdvisoryLock = (): AdvisoryLock => {
  return {
    runExclusive: <T>(
      _name: string,
      work: (manager: EntityManager) => Promise<T>,
    ): Promise<T> => work({} as EntityManager),
  } as unknown as AdvisoryLock;
};
