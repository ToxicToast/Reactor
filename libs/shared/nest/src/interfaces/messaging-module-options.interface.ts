import type { Optional } from '@toxictoast/shared-kernel';
import type { EventHandlersProvider } from './event-handlers-provider.interface.js';

export interface MessagingModuleOptions {
  readonly groupId: string;
  readonly handlers?: Optional<EventHandlersProvider>;
}
