import { Transport, type GrpcOptions } from '@nestjs/microservices';
import { optionalEnv } from '@toxictoast/shared-system';
import {
  GRPC_LOADER_OPTIONS,
  SERVICE_DEFAULTS,
  SERVICE_ENV,
} from '../constants/index.js';
import type { GrpcServerConfig } from '../interfaces/index.js';

export const createGrpcOptions = (config: GrpcServerConfig): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      package: config.package,
      protoPath: config.protoPath,
      url: optionalEnv(SERVICE_ENV.GRPC_URL, SERVICE_DEFAULTS.GRPC_URL),
      loader: { ...GRPC_LOADER_OPTIONS },
    },
  };
};
