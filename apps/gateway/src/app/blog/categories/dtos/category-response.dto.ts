import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CategorySchema } from './category.schema.js';

export class CategoryResponseDto extends createZodDto(
  z.object({ category: CategorySchema }),
) {}
