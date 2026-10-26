import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AUDIT_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import { AUDIT_PACKAGE, AUDIT_PROTO_FILES } from '@toxictoast/contracts-proto';
import { GrpcClientModule } from '@toxictoast/shared-nest';
import { AuditProcessor } from './audit.processor.js';
import { AuditSchedules } from './audit.schedules.js';
import { AUDIT_QUEUE } from './constants/index.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: AUDIT_QUEUE }),
    BullBoardModule.forFeature({ name: AUDIT_QUEUE, adapter: BullMQAdapter }),
    GrpcClientModule.register({
      name: AUDIT_GRPC_CLIENT,
      package: AUDIT_PACKAGE,
      protoPath: AUDIT_PROTO_FILES,
      urlEnv: 'AUDIT_GRPC_URL',
    }),
  ],
  providers: [AuditProcessor, AuditSchedules],
})
export class AuditJobsModule {}
