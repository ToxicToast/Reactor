import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import type { DomainError } from '@toxictoast/shared-kernel';

const STATUS_BY_CODE: Record<string, status> = {
  NOT_FOUND: status.NOT_FOUND,
  VALIDATION: status.INVALID_ARGUMENT,
  CONFLICT: status.FAILED_PRECONDITION,
};

export const toRpcException = (error: DomainError): RpcException => {
  return new RpcException({
    code: STATUS_BY_CODE[error.code] ?? status.INTERNAL,
    message: error.message,
  });
};
