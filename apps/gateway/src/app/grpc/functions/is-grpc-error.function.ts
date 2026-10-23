import type { ServiceError } from '@grpc/grpc-js';

export const isGrpcError = (error: unknown): error is ServiceError => {
  return (
    error instanceof Error &&
    typeof (error as Partial<ServiceError>).code === 'number' &&
    typeof (error as Partial<ServiceError>).details === 'string'
  );
};
