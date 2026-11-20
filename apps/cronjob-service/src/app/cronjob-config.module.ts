import { Global, Module } from '@nestjs/common';
import { uuidEnv } from '@toxictoast/shared-system';
import { CRONJOB_ENV, CRONJOB_TOKENS } from './constants/index.js';

@Global()
@Module({
  providers: [
    {
      provide: CRONJOB_TOKENS.ACTOR_ID,
      useFactory: () => uuidEnv(CRONJOB_ENV.ACTOR_ID),
    },
  ],
  exports: [CRONJOB_TOKENS.ACTOR_ID],
})
export class CronjobConfigModule {}
