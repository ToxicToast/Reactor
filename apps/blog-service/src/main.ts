import 'reflect-metadata';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { bootstrapService } from '@toxictoast/shared-nest';
import { AppModule } from './app/app.module.js';

void bootstrapService(AppModule, {
  package: BLOG_PACKAGE,
  protoPath: BLOG_PROTO_FILES,
});
