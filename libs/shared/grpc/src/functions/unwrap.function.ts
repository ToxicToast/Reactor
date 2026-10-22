import type { Result } from '@toxictoast/shared-kernel';
import { toRpcException } from './to-rpc-exception.function.js';

export const unwrap = <T>(result: Result<T>): T => {
  if (result.isFailure) {
    throw toRpcException(result.error);
  }
  return result.value;
};
