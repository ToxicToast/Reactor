import 'reflect-metadata';
import { AUDIT_PACKAGE, AUDIT_PROTO_FILES } from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: AUDIT_PACKAGE,
  protoPath: AUDIT_PROTO_FILES,
});
