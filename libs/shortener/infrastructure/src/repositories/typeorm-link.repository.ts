import {
  TypeOrmRepository,
  type TransactionContext,
} from '@toxictoast/shared-persistence';
import type { LinkAnemic, LinkRepository } from '@toxictoast/shortener-domain';
import type { DataSource } from 'typeorm';
import type { LinkRow } from '../interfaces/index.js';
import { LinkMapper } from '../mappers/index.js';
import { LinkSchema } from '../schemas/index.js';

export class TypeOrmLinkRepository
  extends TypeOrmRepository<LinkAnemic, LinkRow>
  implements LinkRepository
{
  constructor(dataSource: DataSource, context: TransactionContext) {
    super(dataSource, context, LinkSchema, new LinkMapper());
  }
}
