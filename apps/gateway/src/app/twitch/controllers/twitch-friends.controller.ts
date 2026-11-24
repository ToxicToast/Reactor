import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  AddFriendResponse,
  ListFriendsResponse,
  RemoveFriendResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto } from '../../common/dtos/index.js';
import {
  AddTwitchFriendDto,
  TwitchFriendListResponseDto,
  TwitchFriendResponseDto,
} from '../dtos/index.js';
import { TwitchGateway } from '../twitch.gateway.js';

@ApiTags('Admin · Twitch')
@ApiBearerAuth()
@Controller('api/v1/admin/twitch/friends')
export class TwitchFriendsController {
  constructor(private readonly twitch: TwitchGateway) {}

  @Get()
  @ApiOkResponse({ type: TwitchFriendListResponseDto })
  list(): Observable<ListFriendsResponse> {
    return this.twitch.listFriends();
  }

  @Post()
  @ApiCreatedResponse({ type: TwitchFriendResponseDto })
  add(@Body() body: AddTwitchFriendDto): Observable<AddFriendResponse> {
    return this.twitch.addFriend(body.login);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TwitchFriendResponseDto })
  remove(@Param() { id }: IdParamDto): Observable<RemoveFriendResponse> {
    return this.twitch.removeFriend(id);
  }
}
