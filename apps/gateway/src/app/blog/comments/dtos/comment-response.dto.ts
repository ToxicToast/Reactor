import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CommentSchema } from './comment.schema.js';

export class CommentResponseDto extends createZodDto(
  z.object({ comment: CommentSchema }),
) {}
