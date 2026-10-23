import { Transport, type GrpcOptions } from '@nestjs/microservices';
import { optionalEnv } from '@toxictoast/shared-system';
import { GRPC_LOADER_OPTIONS } from '../constants/index.js';
import type { GrpcServerConfig } from '../interfaces/index.js';

export const createGrpcOptions = (config: GrpcServerConfig): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      package: config.package,
      protoPath: config.protoPath,
      url: optionalEnv('GRPC_URL', '0.0.0.0:50051'),
      loader: { ...GRPC_LOADER_OPTIONS },
    },
  };
};
