import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PostSchema } from './post.schema.js';

export class PostListResponseDto extends createZodDto(
  z.object({ posts: z.array(PostSchema) }),
) {}
