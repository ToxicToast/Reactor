import { Module } from '@nestjs/common';
import { SECURITY_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import {
  SECURITY_PACKAGE,
  SECURITY_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { GrpcModule } from '../../grpc/grpc.module.js';
import { RequestMetadata } from '../../grpc/services/index.js';
import { BanController } from './ban.controller.js';
import { BanGateway } from './ban.gateway.js';

@Module({
  imports: [
    GrpcModule,
    GrpcClientModule.register({
      name: SECURITY_GRPC_CLIENT,
      package: SECURITY_PACKAGE,
      protoPath: SECURITY_PROTO_FILES,
      urlEnv: 'SECURITY_GRPC_URL',
    }),
  ],
  controllers: [BanController],
  providers: [
    provideClass(BanGateway, [SECURITY_GRPC_CLIENT, RequestMetadata]),
  ],
})
export class BanAdminModule {}
