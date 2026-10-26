import type { ModuleMetadata } from '@nestjs/common';
import type { Optional } from '@toxictoast/shared-types';
import type { EventHandlersProvider } from './event-handlers-provider.interface.js';

export interface MessagingModuleOptions {
  readonly groupId: string;
  readonly imports?: Optional<NonNullable<ModuleMetadata['imports']>>;
  readonly handlers?: Optional<EventHandlersProvider>;
  readonly topics?: Optional<ReadonlyArray<string>>;
  readonly topicRetentionMs?: Optional<Readonly<Record<string, number>>>;
  readonly outbox?: Optional<boolean>;
  readonly replay?: Optional<boolean>;
  readonly consumeTopics?: Optional<ReadonlyArray<string>>;
}
