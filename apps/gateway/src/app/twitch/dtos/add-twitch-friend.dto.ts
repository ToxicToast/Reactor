import { createZodDto } from 'nestjs-zod';
import { AddTwitchFriendBodySchema } from './add-twitch-friend-body.schema.js';

export class AddTwitchFriendDto extends createZodDto(
  AddTwitchFriendBodySchema,
) {}
