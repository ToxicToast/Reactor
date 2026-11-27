export interface OAuthTokenSchemaOptions {
  /** Entity-Name, z. B. TwitchToken */
  readonly name: string;
  readonly tableName: string;
  /** Name der Schlüsselspalte in der Datenbank, z. B. channel_id */
  readonly ownerColumn: string;
}
