import { CommentStatus } from '@toxictoast/contracts-grpc';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';

export class ListCommentsByStatusQueryDto extends createZodDto(
  PagingSchema.extend({
    status: z.enum([
      CommentStatus.COMMENT_STATUS_PENDING,
      CommentStatus.COMMENT_STATUS_APPROVED,
      CommentStatus.COMMENT_STATUS_SPAM,
      CommentStatus.COMMENT_STATUS_HATE,
    ]),
  }),
) {}
