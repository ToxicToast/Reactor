import type {
  OAuthToken,
  OAuthTokenStore,
} from '@toxictoast/shared-application';
import type { Clock } from '@toxictoast/shared-kernel';
import type { SecretCipher } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { DataSource, EntitySchema } from 'typeorm';
import { TypeOrmTableRepository } from '../abstracts/index.js';
import type { TransactionContext } from '../classes/index.js';
import { OAuthTokenMapper } from '../classes/index.js';
import type { OAuthTokenRow } from '../interfaces/index.js';

export class TypeOrmOAuthTokenStore<TOwnerId extends string = string>
  extends TypeOrmTableRepository<OAuthTokenRow>
  implements OAuthTokenStore<TOwnerId>
{
  private readonly mapper: OAuthTokenMapper;

  constructor(
    dataSource: DataSource,
    context: TransactionContext,
    cipher: SecretCipher,
    private readonly clock: Clock,
    schema: EntitySchema<OAuthTokenRow>,
  ) {
    super(dataSource, context, schema);
    this.mapper = new OAuthTokenMapper(cipher);
  }

  async save(ownerId: TOwnerId, token: OAuthToken): Promise<void> {
    await this.repository().upsert(
      this.mapper.toRow(ownerId, token, this.clock.now()),
      ['owner_id'],
    );
  }

  async find(ownerId: TOwnerId): Promise<Nullable<OAuthToken>> {
    const row = await this.repository().findOneBy({ owner_id: ownerId });
    if (!row) {
      return null;
    }
    return this.mapper.toToken(row);
  }

  async remove(ownerId: TOwnerId): Promise<void> {
    await this.repository().delete({ owner_id: ownerId });
  }
}
