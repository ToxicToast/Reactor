import { z } from 'zod';
import { enumKeys } from '../../../common/functions/index.js';
import { WEBHOOK_DELIVERY_STATUS_QUERY } from '../constants/index.js';

export const TwitchWebhookDeliverySchema = z.object({
  id: z.uuid(),
  webhook_id: z.uuid(),
  event_key: z.string(),
  event_id: z.string(),
  status: z.enum(enumKeys(WEBHOOK_DELIVERY_STATUS_QUERY)),
  attempts: z.number().int(),
  last_status_code: z.number().int().optional(),
  last_error: z.string().optional(),
  next_attempt_at: z.string().optional(),
  delivered_at: z.string().optional(),
  created_at: z.string(),
});
