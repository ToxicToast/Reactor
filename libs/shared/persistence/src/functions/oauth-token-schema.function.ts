import { EntitySchema } from 'typeorm';
import type {
  OAuthTokenRow,
  OAuthTokenSchemaOptions,
} from '../interfaces/index.js';

/** dieselbe Tabelle für jede Plattform; nur Name und Schlüsselspalte unterscheiden sich */
export const oauthTokenSchema = (
  options: OAuthTokenSchemaOptions,
): EntitySchema<OAuthTokenRow> => {
  return new EntitySchema<OAuthTokenRow>({
    name: options.name,
    tableName: options.tableName,
    columns: {
      owner_id: { type: 'uuid', primary: true, name: options.ownerColumn },
      access_token: { type: 'text' },
      refresh_token: { type: 'text', nullable: true },
      scopes: { type: 'text', array: true },
      expires_in: { type: 'int', nullable: true },
      obtained_at: { type: 'timestamptz' },
      updated_at: { type: 'timestamptz' },
    },
  });
};
