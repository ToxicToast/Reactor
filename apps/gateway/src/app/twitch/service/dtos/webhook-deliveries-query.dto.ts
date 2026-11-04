import { createZodDto } from 'nestjs-zod';
import { PagingSchema } from '../../../common/dtos/index.js';
import { enumQuery } from '../../../common/functions/index.js';
import { WEBHOOK_DELIVERY_STATUS_QUERY } from '../constants/index.js';

export class WebhookDeliveriesQueryDto extends createZodDto(
  PagingSchema.extend({
    status: enumQuery(WEBHOOK_DELIVERY_STATUS_QUERY).optional(),
  }),
) {}
