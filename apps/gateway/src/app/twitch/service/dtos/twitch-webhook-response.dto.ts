import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchWebhookSchema } from './twitch-webhook.schema.js';

export class TwitchWebhookResponseDto extends createZodDto(
  z.object({ webhook: TwitchWebhookSchema }),
) {}
