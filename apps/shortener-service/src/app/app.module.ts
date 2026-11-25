import { Module } from '@nestjs/common';
import { ShortenerTopics } from '@toxictoast/contracts-events';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import {
  shortenerMigrations,
  shortenerSchemas,
} from '@toxictoast/shortener-infrastructure';
import { ShortenerModule } from './shortener.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: shortenerSchemas,
      migrations: shortenerMigrations,
    }),
    MessagingModule.forRoot({
      groupId: 'shortener-service',
      topics: [...Object.values(ShortenerTopics)],
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true }),
    ShortenerModule,
  ],
})
export class AppModule {}
