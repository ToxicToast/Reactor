import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { ListClipsResponse } from '@toxictoast/contracts-grpc';
import { map, type Observable } from 'rxjs';
import {
  ChannelIdParamDto,
  ClipListResponseDto,
  ClipQueryDto,
  VideoListResponseDto,
  VideoQueryDto,
} from '../dtos/index.js';
import { videoView } from '../functions/index.js';
import type { VideoView } from '../interfaces/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

@ApiTags('Twitch · Clips & VODs')
@Controller('api/v1/twitch/channels')
export class TwitchMediaController {
  constructor(private readonly twitch: TwitchServiceGateway) {}

  @Get(':channel_id/clips')
  @ApiOkResponse({ type: ClipListResponseDto })
  clips(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: ClipQueryDto,
  ): Observable<ListClipsResponse> {
    return this.twitch.listClips({ channel_id, ...query });
  }

  @Get(':channel_id/videos')
  @ApiOkResponse({ type: VideoListResponseDto })
  videos(
    @Param() { channel_id }: ChannelIdParamDto,
    @Query() query: VideoQueryDto,
  ): Observable<{ videos: Array<VideoView> }> {
    return this.twitch.listVideos({ channel_id, ...query }).pipe(
      map((response) => {
        return { videos: response.videos.map(videoView) };
      }),
    );
  }
}
