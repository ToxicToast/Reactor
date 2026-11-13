import type { SecretCipher } from '@toxictoast/shared-system';
import type { DataSource, EntitySchema, ObjectLiteral } from 'typeorm';
import type { SecretRotation } from '../interfaces/index.js';

export class SecretColumnRotator<
  TRow extends ObjectLiteral,
> implements SecretRotation {
  constructor(
    private readonly dataSource: DataSource,
    private readonly schema: EntitySchema<TRow>,
    private readonly columns: ReadonlyArray<keyof TRow & string>,
    private readonly cipher: SecretCipher,
  ) {}

  get table(): string {
    return this.schema.options.tableName ?? this.schema.options.name;
  }

  async rotate(): Promise<number> {
    const repository = this.dataSource.getRepository(this.schema);
    const rows = await repository.find();

    let rotated = 0;
    for (const row of rows) {
      const changes = this.changesFor(row);
      if (Object.keys(changes).length === 0) {
        continue;
      }
      await repository.save({ ...row, ...changes });
      rotated++;
    }
    return rotated;
  }

  private changesFor(row: TRow): Partial<TRow> {
    const changes: Record<string, string> = {};
    for (const column of this.columns) {
      const value: unknown = row[column];
      if (typeof value !== 'string' || this.cipher.isCurrent(value)) {
        continue;
      }
      const plain = this.cipher.isEncrypted(value)
        ? this.cipher.decrypt(value)
        : value;
      changes[column] = this.cipher.encrypt(plain);
    }
    return changes as Partial<TRow>;
  }
}
