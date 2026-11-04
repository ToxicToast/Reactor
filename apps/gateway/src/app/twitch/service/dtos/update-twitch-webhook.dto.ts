import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CreateTwitchWebhookBodySchema } from './create-twitch-webhook-body.schema.js';

export class UpdateTwitchWebhookDto extends createZodDto(
  CreateTwitchWebhookBodySchema.extend({ active: z.boolean() }),
) {}
