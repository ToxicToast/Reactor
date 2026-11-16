import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { map, type Observable } from 'rxjs';
import {
  ChannelIdParamDto,
  ChatMessageListResponseDto,
  ChatQueryDto,
} from '../dtos/index.js';
import { chatMessageView } from '../functions/index.js';
import type { ChatMessageView } from '../interfaces/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

@ApiTags('Admin · Twitch')
@ApiBearerAuth()
@Controller('api/v1/admin/twitch/chat')
export class TwitchChatController {
  constructor(private readonly twitch: TwitchServiceGateway) {}

  @Get(':channel_id')
  @ApiOkResponse({ type: ChatMessageListResponseDto })
  list(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() { q, ...query }: ChatQueryDto,
  ): Observable<{ messages: Array<ChatMessageView> }> {
    return this.twitch
      .listChatMessages({ channel_id, ...query, query: q })
      .pipe(
        map((response) => {
          return { messages: response.messages.map(chatMessageView) };
        }),
      );
  }
}
