import { status } from '@grpc/grpc-js';
import { HttpStatus } from '@nestjs/common';

export const HTTP_STATUS_BY_GRPC_CODE: Readonly<
  Partial<Record<status, HttpStatus>>
> = {
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.FAILED_PRECONDITION]: HttpStatus.CONFLICT,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};
