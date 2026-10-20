import type { InjectionToken } from '@nestjs/common';
import type { EventHandler } from '@toxictoast/shared-messaging';

export interface EventHandlersProvider {
  readonly inject: Array<InjectionToken>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly useFactory: (
    ...deps: Array<any>
  ) => Readonly<Record<string, EventHandler>>;
}
