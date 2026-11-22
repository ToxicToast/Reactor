import { TransactionContext } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';

/** Was jedes TypeORM-Repository über provideClass injiziert bekommt. */
export const DATABASE_INJECT = [DataSource, TransactionContext];
