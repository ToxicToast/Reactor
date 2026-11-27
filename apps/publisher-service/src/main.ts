import 'reflect-metadata';
import {
  PUBLISHER_PACKAGE,
  PUBLISHER_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: PUBLISHER_PACKAGE,
  protoPath: PUBLISHER_PROTO_FILES,
});
