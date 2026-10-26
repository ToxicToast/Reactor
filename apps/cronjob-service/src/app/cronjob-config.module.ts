import { Global, Module } from '@nestjs/common';
import { CRONJOB_TOKENS } from './constants/index.js';
import { uuidEnv } from '@toxictoast/shared-system';

@Global()
@Module({
  providers: [
    {
      provide: CRONJOB_TOKENS.ACTOR_ID,
      useFactory: () => uuidEnv('CRONJOB_ACTOR_ID'),
    },
  ],
  exports: [CRONJOB_TOKENS.ACTOR_ID],
})
export class CronjobConfigModule {}
