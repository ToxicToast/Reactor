import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { Clock, DomainContext } from '@toxictoast/shared-kernel';
import {
  ActorContext,
  SystemClock,
  UuidV7Generator,
} from '@toxictoast/shared-system';
import { TOKENS } from '../constants/index.js';
import { ActorInterceptor } from '../interceptors/index.js';

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
    { provide: ActorContext, useValue: new ActorContext() },
    { provide: APP_INTERCEPTOR, useClass: ActorInterceptor },
  ],
  exports: [TOKENS.CLOCK, TOKENS.DOMAIN_CONTEXT, ActorContext],
})
export class SystemModule {}
