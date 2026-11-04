import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchWebhookDeliverySchema } from './twitch-webhook-delivery.schema.js';

export class TwitchWebhookDeliveryListResponseDto extends createZodDto(
  z.object({ deliveries: z.array(TwitchWebhookDeliverySchema) }),
) {}
