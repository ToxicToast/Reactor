import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ChatMessageSchema } from './chat-message.schema.js';

export class ChatMessageListResponseDto extends createZodDto(
  z.object({ messages: z.array(ChatMessageSchema) }),
) {}
