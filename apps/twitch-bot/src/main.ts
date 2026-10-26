import 'reflect-metadata';
import {
  TWITCH_BOT_PACKAGE,
  TWITCH_BOT_PROTO_FILES,
} from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: TWITCH_BOT_PACKAGE,
  protoPath: TWITCH_BOT_PROTO_FILES,
});
