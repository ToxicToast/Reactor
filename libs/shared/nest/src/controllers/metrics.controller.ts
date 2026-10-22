import { Controller, Get, Header, Inject } from '@nestjs/common';
import { Registry } from 'prom-client';
import { TOKENS } from '../constants/index.js';

@Controller('metrics')
export class MetricsController {
  constructor(
    @Inject(TOKENS.METRICS_REGISTRY) private readonly registry: Registry,
  ) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
