import { Global, Module } from '@nestjs/common';
import type { Clock, DomainContext } from '@toxictoast/shared-kernel';
import { SystemClock, UuidV7Generator } from '@toxictoast/shared-system';
import { TOKENS } from '../constants/index.js';

@Global()
@Module({
  providers: [
    { provide: TOKENS.CLOCK, useClass: SystemClock },
    {
      provide: TOKENS.DOMAIN_CONTEXT,
      inject: [TOKENS.CLOCK],
      useFactory: (clock: Clock): DomainContext => {
        return { id: new UuidV7Generator(clock), date: clock };
      },
    },
  ],
  exports: [TOKENS.CLOCK, TOKENS.DOMAIN_CONTEXT],
})
export class SystemModule {}
