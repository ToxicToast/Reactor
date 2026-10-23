import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BLOG_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { GrpcClientModule } from '@toxictoast/shared-nest';
import { BlogProcessor } from './blog.processor.js';
import { BlogSchedules } from './blog.schedules.js';
import { BLOG_QUEUE } from './constants/index.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: BLOG_QUEUE }),
    BullBoardModule.forFeature({ name: BLOG_QUEUE, adapter: BullMQAdapter }),
    GrpcClientModule.register({
      name: BLOG_GRPC_CLIENT,
      package: BLOG_PACKAGE,
      protoPath: BLOG_PROTO_FILES,
      urlEnv: 'BLOG_GRPC_URL',
    }),
  ],
  providers: [BlogProcessor, BlogSchedules],
})
export class BlogJobsModule {}
