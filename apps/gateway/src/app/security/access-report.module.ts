import { Module } from '@nestjs/common';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import { AccessDeniedReporter } from './services/index.js';

@Module({
  providers: [
    provideClass(AccessDeniedReporter, [
      TOKENS.EVENT_PUBLISHER,
      TOKENS.DOMAIN_CONTEXT,
      ActorContext,
      CorrelationContext,
    ]),
  ],
  exports: [AccessDeniedReporter],
})
export class AccessReportModule {}
