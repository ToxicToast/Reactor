import type { Nullable } from '@toxictoast/shared-types';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export const whereWithin = <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  column: string,
  range: {
    readonly from: Nullable<Date | string>;
    readonly to: Nullable<Date | string>;
  },
): SelectQueryBuilder<T> => {
  if (range.from !== null) {
    query.andWhere(`${column} >= :rangeFrom`, { rangeFrom: range.from });
  }
  if (range.to !== null) {
    query.andWhere(`${column} <= :rangeTo`, { rangeTo: range.to });
  }
  return query;
};
