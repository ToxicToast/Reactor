import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchWebhookSchema } from './twitch-webhook.schema.js';

/** Das Secret gibt es nur bei Create und Rotate, danach nie wieder. */
export class TwitchWebhookSecretResponseDto extends createZodDto(
  z.object({ webhook: TwitchWebhookSchema, secret: z.string() }),
) {}
