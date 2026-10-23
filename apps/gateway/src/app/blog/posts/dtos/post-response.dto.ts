import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PostSchema } from './post.schema.js';

export class PostResponseDto extends createZodDto(
  z.object({ post: PostSchema }),
) {}
