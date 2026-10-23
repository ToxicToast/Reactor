import { MediaStatus } from '@toxictoast/contracts-grpc';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';

export class ListMediaQueryDto extends createZodDto(
  PagingSchema.extend({
    status: z
      .enum([MediaStatus.MEDIA_STATUS_PENDING, MediaStatus.MEDIA_STATUS_READY])
      .optional(),
    with_deleted: z.stringbool().default(false),
  }),
) {}
