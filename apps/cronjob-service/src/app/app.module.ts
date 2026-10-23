import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  HealthModule,
  MetricsModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { BlogJobsModule } from './blog/blog-jobs.module.js';
import { CronjobConfigModule } from './cronjob-config.module.js';
import {
  defaultJobOptionsFromEnv,
  redisConnectionFromEnv,
} from './functions/index.js';

@Module({
  imports: [
    SystemModule,
    CronjobConfigModule,
    HealthModule.forRoot({ database: false }),
    MetricsModule.forRoot({ outbox: false }),
    BullModule.forRootAsync({
      useFactory: () => {
        return {
          connection: redisConnectionFromEnv(),
          defaultJobOptions: defaultJobOptionsFromEnv(),
          prefix: 'cronjob',
        };
      },
    }),
    BullBoardModule.forRoot({ route: '/queues', adapter: ExpressAdapter }),
    BlogJobsModule,
  ],
})
export class AppModule {}
