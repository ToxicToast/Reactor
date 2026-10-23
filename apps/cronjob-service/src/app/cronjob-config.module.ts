import { Global, Module } from '@nestjs/common';
import { CRONJOB_TOKENS } from './constants/index.js';
import { cronjobActorIdFromEnv } from './functions/index.js';

@Global()
@Module({
  providers: [
    {
      provide: CRONJOB_TOKENS.ACTOR_ID,
      useFactory: () => cronjobActorIdFromEnv(),
    },
  ],
  exports: [CRONJOB_TOKENS.ACTOR_ID],
})
export class CronjobConfigModule {}
