import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Nur die Form – ob es eine gültige Twitch-ID ist, prüft der twitch-service. */
export class ChannelIdParamDto extends createZodDto(
  z.object({
    channel_id: z.string().trim().min(1),
  }),
) {}
