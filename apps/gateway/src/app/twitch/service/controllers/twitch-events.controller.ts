import { Controller, Query, Req, Sse, type MessageEvent } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { TwitchPermission } from '@toxictoast/contracts-grpc';
import { ActorContext } from '@toxictoast/shared-system';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { AdminSessions } from '../../../admin/services/index.js';
import { sseStream } from '../../../common/functions/index.js';
import { TWITCH_SSE_EVENTS } from '../constants/index.js';
import { EventsStreamQueryDto } from '../dtos/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

/** Liegt unter /admin, weil nur dorthin das Session-Cookie geschickt wird; so reicht ein normales EventSource. */
@ApiExcludeController()
@Controller('admin/twitch')
export class TwitchEventsController {
  constructor(
    private readonly sessions: AdminSessions,
    private readonly twitch: TwitchServiceGateway,
    private readonly actors: ActorContext,
  ) {}

  @Sse('events')
  async events(
    @Req() request: Request,
    @Query() query: EventsStreamQueryDto,
  ): Promise<Observable<MessageEvent>> {
    const actor = await this.sessions.requireActor(
      request,
      TwitchPermission.STATS_READ,
    );
    const events = this.actors.run(actor, () => this.twitch.watchEvents(query));
    return sseStream(events, TWITCH_SSE_EVENTS.EVENT);
  }
}
