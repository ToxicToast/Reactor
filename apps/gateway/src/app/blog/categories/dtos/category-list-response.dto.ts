import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CategorySchema } from './category.schema.js';

export class CategoryListResponseDto extends createZodDto(
  z.object({ categories: z.array(CategorySchema) }),
) {}
