import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { createGrpcClientOptions } from '@toxictoast/shared-nest';
import { requiredEnv } from '@toxictoast/shared-system';
import { BlogProcessor } from './blog.processor.js';
import { BlogSchedules } from './blog.schedules.js';
import { BLOG_GRPC_CLIENT, BLOG_QUEUE } from './constants/index.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: BLOG_QUEUE }),
    BullBoardModule.forFeature({ name: BLOG_QUEUE, adapter: BullMQAdapter }),
    ClientsModule.registerAsync([
      {
        name: BLOG_GRPC_CLIENT,
        useFactory: () => {
          return createGrpcClientOptions({
            package: BLOG_PACKAGE,
            protoPath: BLOG_PROTO_FILES,
            url: requiredEnv('BLOG_GRPC_URL'),
          });
        },
      },
    ]),
  ],
  providers: [BlogProcessor, BlogSchedules],
})
export class BlogJobsModule {}
