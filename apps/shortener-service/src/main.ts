import 'reflect-metadata';
import {
  SHORTENER_PACKAGE,
  SHORTENER_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: SHORTENER_PACKAGE,
  protoPath: SHORTENER_PROTO_FILES,
});
