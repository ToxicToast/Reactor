import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const unauthenticated = (message: string): RpcException => {
  return new RpcException({ code: status.UNAUTHENTICATED, message });
};
