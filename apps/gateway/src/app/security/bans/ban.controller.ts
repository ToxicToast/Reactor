import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type {
  ListBansResponse,
  UnbanIpResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { BanGateway } from './ban.gateway.js';
import {
  BanListResponseDto,
  BanResponseDto,
  IpParamDto,
  ListBansQueryDto,
} from './dtos/index.js';

@ApiTags('Admin · Bans')
@ApiBearerAuth()
@Controller('api/v1/admin/bans')
export class BanController {
  constructor(private readonly bans: BanGateway) {}

  @Get()
  @ApiOkResponse({ type: BanListResponseDto })
  list(@Query() query: ListBansQueryDto): Observable<ListBansResponse> {
    return this.bans.list(query);
  }

  @Delete(':ip')
  @ApiOkResponse({ type: BanResponseDto })
  unban(@Param() { ip }: IpParamDto): Observable<UnbanIpResponse> {
    return this.bans.unban(ip);
  }
}
