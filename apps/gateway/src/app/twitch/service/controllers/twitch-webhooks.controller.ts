import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateTwitchWebhookResponse,
  DeleteTwitchWebhookResponse,
  ListTwitchWebhooksResponse,
  RotateTwitchWebhookSecretResponse,
  UpdateTwitchWebhookResponse,
} from '@toxictoast/contracts-grpc';
import { map, type Observable } from 'rxjs';
import { IdParamDto } from '../../../common/dtos/index.js';
import {
  CreateTwitchWebhookDto,
  TwitchWebhookDeliveryListResponseDto,
  TwitchWebhookListResponseDto,
  TwitchWebhookResponseDto,
  TwitchWebhookSecretResponseDto,
  UpdateTwitchWebhookDto,
  WebhookDeliveriesQueryDto,
} from '../dtos/index.js';
import { webhookDeliveryView } from '../functions/index.js';
import type { WebhookDeliveryView } from '../interfaces/index.js';
import { TwitchServiceGateway } from '../twitch-service.gateway.js';

@ApiTags('Admin · Twitch')
@ApiBearerAuth()
@Controller('api/v1/admin/twitch/webhooks')
export class TwitchWebhooksController {
  constructor(private readonly twitch: TwitchServiceGateway) {}

  @Get()
  @ApiOkResponse({ type: TwitchWebhookListResponseDto })
  list(): Observable<ListTwitchWebhooksResponse> {
    return this.twitch.listWebhooks();
  }

  @Post()
  @ApiCreatedResponse({ type: TwitchWebhookSecretResponseDto })
  create(
    @Body() body: CreateTwitchWebhookDto,
  ): Observable<CreateTwitchWebhookResponse> {
    return this.twitch.createWebhook(body);
  }

  @Put(':id')
  @ApiOkResponse({ type: TwitchWebhookResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() body: UpdateTwitchWebhookDto,
  ): Observable<UpdateTwitchWebhookResponse> {
    return this.twitch.updateWebhook({ id, ...body });
  }

  @Delete(':id')
  @ApiOkResponse({ type: TwitchWebhookResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteTwitchWebhookResponse> {
    return this.twitch.deleteWebhook(id);
  }

  @Post(':id/rotate-secret')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TwitchWebhookSecretResponseDto })
  rotateSecret(
    @Param() { id }: IdParamDto,
  ): Observable<RotateTwitchWebhookSecretResponse> {
    return this.twitch.rotateWebhookSecret(id);
  }

  @Get(':id/deliveries')
  @ApiOkResponse({ type: TwitchWebhookDeliveryListResponseDto })
  deliveries(
    @Param() { id }: IdParamDto,
    @Query() query: WebhookDeliveriesQueryDto,
  ): Observable<{ deliveries: Array<WebhookDeliveryView> }> {
    return this.twitch.listWebhookDeliveries({ webhook_id: id, ...query }).pipe(
      map((response) => {
        return { deliveries: response.deliveries.map(webhookDeliveryView) };
      }),
    );
  }
}
