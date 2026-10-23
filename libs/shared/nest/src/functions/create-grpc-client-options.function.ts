import { Transport, type GrpcOptions } from '@nestjs/microservices';
import { GRPC_LOADER_OPTIONS } from '../constants/index.js';
import type { GrpcClientConfig } from '../interfaces/index.js';

export const createGrpcClientOptions = (
  config: GrpcClientConfig,
): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      package: config.package,
      protoPath: config.protoPath,
      url: config.url,
      loader: { ...GRPC_LOADER_OPTIONS },
    },
  };
};
