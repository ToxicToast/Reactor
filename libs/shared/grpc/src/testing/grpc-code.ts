import { RpcException } from '@nestjs/microservices';
import type { Optional } from '@toxictoast/shared-kernel';

export const grpcCode = (
  promise: Promise<unknown>,
): Promise<Optional<number>> => {
  return promise.then(
    () => undefined,
    (error: unknown) => {
      if (error instanceof RpcException) {
        return (error.getError() as { code: number }).code;
      }
      throw error;
    },
  );
};
