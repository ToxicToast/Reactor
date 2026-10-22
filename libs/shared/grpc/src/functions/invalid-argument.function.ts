import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const invalidArgument = (message: string): RpcException => {
  return new RpcException({ code: status.INVALID_ARGUMENT, message });
};
