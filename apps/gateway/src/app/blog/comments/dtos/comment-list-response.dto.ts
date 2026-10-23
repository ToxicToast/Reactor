import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CommentSchema } from './comment.schema.js';

export class CommentListResponseDto extends createZodDto(
  z.object({ comments: z.array(CommentSchema) }),
) {}
