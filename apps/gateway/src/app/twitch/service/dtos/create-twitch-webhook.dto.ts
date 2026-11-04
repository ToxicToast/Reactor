import { createZodDto } from 'nestjs-zod';
import { CreateTwitchWebhookBodySchema } from './create-twitch-webhook-body.schema.js';

export class CreateTwitchWebhookDto extends createZodDto(
  CreateTwitchWebhookBodySchema,
) {}
