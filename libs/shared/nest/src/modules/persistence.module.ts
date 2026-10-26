import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import {
  DomainPersistence,
  type Outbox,
  type UnitOfWork,
} from '@toxictoast/shared-application';
import { ActorProvider, CorrelationProvider } from '@toxictoast/shared-kernel';
import {
  dataSourceOptionsFromEnv,
  TransactionContext,
  TypeOrmOutbox,
  TypeOrmUnitOfWork,
  type DataSourceConfig,
} from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import type { PersistenceModuleOptions } from '../interfaces/index.js';
import { DataSourceLifecycle } from '../lifecycles/index.js';

const outboxProviders = (): Array<Provider> => {
  return [
    {
      provide: TOKENS.OUTBOX,
      inject: [TransactionContext, ActorProvider, CorrelationProvider],
      useFactory: (
        context: TransactionContext,
        actors: ActorProvider,
        correlations: CorrelationProvider,
      ): Outbox => {
        return new TypeOrmOutbox(context, actors, correlations);
      },
    },
    {
      provide: DomainPersistence,
      inject: [TOKENS.OUTBOX, TOKENS.UNIT_OF_WORK],
      useFactory: (outbox: Outbox, uow: UnitOfWork) => {
        return new DomainPersistence(outbox, uow);
      },
    },
  ];
};

@Module({})
export class PersistenceModule {
  static forRoot(
    config: DataSourceConfig,
    options: PersistenceModuleOptions = {},
  ): DynamicModule {
    const withOutbox = options.outbox !== false;

    return {
      module: PersistenceModule,
      global: true,
      providers: [
        {
          provide: DataSource,
          useFactory: async (): Promise<DataSource> => {
            const dataSource = new DataSource({
              ...dataSourceOptionsFromEnv(config),
              migrationsRun: true,
            });
            await dataSource.initialize();
            return dataSource;
          },
        },
        {
          provide: TransactionContext,
          useValue: new TransactionContext(),
        },
        {
          provide: TOKENS.UNIT_OF_WORK,
          inject: [DataSource, TransactionContext],
          useFactory: (
            dataSource: DataSource,
            context: TransactionContext,
          ): UnitOfWork => {
            return new TypeOrmUnitOfWork(dataSource, context);
          },
        },
        ...(withOutbox ? outboxProviders() : []),
        DataSourceLifecycle,
      ],
      exports: [
        DataSource,
        TransactionContext,
        TOKENS.UNIT_OF_WORK,
        ...(withOutbox ? [TOKENS.OUTBOX, DomainPersistence] : []),
      ],
    };
  }
}
