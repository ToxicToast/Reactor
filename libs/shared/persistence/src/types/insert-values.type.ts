import type { InsertQueryBuilder, ObjectLiteral } from 'typeorm';

export type InsertValues<T extends ObjectLiteral> = Parameters<
  InsertQueryBuilder<T>['values']
>[0];
