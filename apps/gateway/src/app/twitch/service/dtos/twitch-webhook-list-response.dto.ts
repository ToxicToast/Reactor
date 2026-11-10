import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchWebhookSchema } from './twitch-webhook.schema.js';

export class TwitchWebhookListResponseDto extends createZodDto(
  z.object({ webhooks: z.array(TwitchWebhookSchema) }),
) {}
