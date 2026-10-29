import 'reflect-metadata';
import {
  TWITCH_PACKAGE,
  TWITCH_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: TWITCH_PACKAGE,
  protoPath: TWITCH_PROTO_FILES,
});
