import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PagingSchema } from '../../../common/dtos/index.js';
import { enumQuery } from '../../../common/functions/index.js';
import { VIDEO_TYPES } from '../constants/index.js';

export class VideoQueryDto extends createZodDto(
  PagingSchema.extend({
    type: enumQuery(VIDEO_TYPES).optional(),
    session_id: z.uuid().optional(),
  }),
) {}
