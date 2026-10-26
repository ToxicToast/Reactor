import 'reflect-metadata';
import {
  SECURITY_PACKAGE,
  SECURITY_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: SECURITY_PACKAGE,
  protoPath: SECURITY_PROTO_FILES,
});
