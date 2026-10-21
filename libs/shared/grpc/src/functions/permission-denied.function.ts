import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

export const permissionDenied = (message: string): RpcException => {
  return new RpcException({ code: status.PERMISSION_DENIED, message });
};
