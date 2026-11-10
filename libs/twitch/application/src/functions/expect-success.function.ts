import type { Result } from '@toxictoast/shared-kernel';

export const expectSuccess = <T>(result: Result<T>): T => {
  if (result.isFailure) {
    throw result.error;
  }
  return result.value;
};
