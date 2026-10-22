import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { Gauge, Registry } from 'prom-client';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import { Nullable } from '@toxictoast/shared-types';

interface OutboxStats {
  readonly count: string;
  readonly oldest_seconds: Nullable<string>;
}

@Injectable()
export class OutboxMetrics implements OnModuleInit {
  constructor(
    @Inject(TOKENS.METRICS_REGISTRY) private readonly registry: Registry,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    const stats = (): Promise<Array<OutboxStats>> => {
      return this.dataSource.query(
        `SELECT count(*) AS count,
                EXTRACT(EPOCH FROM now() - min(occurred_at)) AS oldest_seconds
           FROM outbox
          WHERE published_at IS NULL`,
      );
    };

    new Gauge({
      name: 'outbox_unpublished_events',
      help: 'Number of outbox events waiting to be published',
      registers: [this.registry],
      async collect() {
        const [row] = await stats();
        this.set(Number(row?.count ?? 0));
      },
    });

    new Gauge({
      name: 'outbox_oldest_unpublished_seconds',
      help: 'Age of the oldest outbox event waiting to be published',
      registers: [this.registry],
      async collect() {
        const [row] = await stats();
        this.set(Number(row?.oldest_seconds ?? 0));
      },
    });
  }
}
