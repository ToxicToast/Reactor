import { PostStatus } from '@toxictoast/contracts-grpc';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';

export class ListPostsQueryDto extends createZodDto(
  PagingSchema.extend({
    status: z
      .enum([
        PostStatus.POST_STATUS_DRAFT,
        PostStatus.POST_STATUS_PUBLISHED,
        PostStatus.POST_STATUS_ARCHIVED,
      ])
      .optional(),
    category_id: z.uuid().optional(),
    tag_id: z.uuid().optional(),
  }),
) {}
