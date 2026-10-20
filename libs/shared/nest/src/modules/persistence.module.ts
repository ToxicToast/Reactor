import { Module, type DynamicModule } from '@nestjs/common';
import {
  DomainPersistence,
  type Outbox,
  type UnitOfWork,
} from '@toxictoast/shared-application';
import {
  dataSourceOptionsFromEnv,
  TransactionContext,
  TypeOrmOutbox,
  TypeOrmUnitOfWork,
  type DataSourceConfig,
} from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import { DataSourceLifecycle } from '../lifecycles/index.js';
import { ActorContext } from '@toxictoast/shared-system';

@Module({})
export class PersistenceModule {
  static forRoot(config: DataSourceConfig): DynamicModule {
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
        {
          provide: TOKENS.OUTBOX,
          inject: [TransactionContext, ActorContext],
          useFactory: (
            context: TransactionContext,
            actors: ActorContext,
          ): Outbox => {
            return new TypeOrmOutbox(context, actors);
          },
        },
        {
          provide: DomainPersistence,
          inject: [TOKENS.OUTBOX, TOKENS.UNIT_OF_WORK],
          useFactory: (outbox: Outbox, uow: UnitOfWork) => {
            return new DomainPersistence(outbox, uow);
          },
        },
        DataSourceLifecycle,
      ],
      exports: [
        DataSource,
        TransactionContext,
        TOKENS.UNIT_OF_WORK,
        TOKENS.OUTBOX,
        DomainPersistence,
      ],
    };
  }
}
