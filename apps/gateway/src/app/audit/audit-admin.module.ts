import { Module } from '@nestjs/common';
import { AUDIT_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import { AUDIT_PACKAGE, AUDIT_PROTO_FILES } from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { GrpcModule } from '../grpc/grpc.module.js';
import { ActorMetadata } from '../grpc/services/index.js';
import { AuditController } from './audit.controller.js';
import { AuditGateway } from './audit.gateway.js';

@Module({
  imports: [
    GrpcModule,
    GrpcClientModule.register({
      name: AUDIT_GRPC_CLIENT,
      package: AUDIT_PACKAGE,
      protoPath: AUDIT_PROTO_FILES,
      urlEnv: 'AUDIT_GRPC_URL',
    }),
  ],
  controllers: [AuditController],
  providers: [provideClass(AuditGateway, [AUDIT_GRPC_CLIENT, ActorMetadata])],
})
export class AuditAdminModule {}
