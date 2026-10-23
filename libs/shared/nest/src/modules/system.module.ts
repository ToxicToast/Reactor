import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  ActorProvider,
  CorrelationProvider,
  type Clock,
  type DomainContext,
} from '@toxictoast/shared-kernel';
import {
  ActorContext,
  CorrelationContext,
  SystemClock,
  UuidV7Generator,
} from '@toxictoast/shared-system';
import { TOKENS } from '../constants/index.js';
import {
  ActorInterceptor,
  CorrelationInterceptor,
} from '../interceptors/index.js';

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
    { provide: ActorProvider, useExisting: ActorContext },
    { provide: CorrelationContext, useValue: new CorrelationContext() },
    { provide: CorrelationProvider, useExisting: CorrelationContext },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ActorInterceptor },
  ],
  exports: [
    TOKENS.CLOCK,
    TOKENS.DOMAIN_CONTEXT,
    ActorContext,
    ActorProvider,
    CorrelationContext,
    CorrelationProvider,
  ],
})
export class SystemModule {}
