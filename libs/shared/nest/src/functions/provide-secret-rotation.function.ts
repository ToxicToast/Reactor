import type { InjectionToken, Provider } from '@nestjs/common';
import { SecretColumnRotator } from '@toxictoast/shared-persistence';
import type { SecretCipher } from '@toxictoast/shared-system';
import { DataSource, type EntitySchema, type ObjectLiteral } from 'typeorm';
import { SecretRotationLifecycle } from '../lifecycles/index.js';

export const provideSecretRotation = <TRow extends ObjectLiteral>(
  cipherToken: InjectionToken,
  schema: EntitySchema<TRow>,
  columns: ReadonlyArray<keyof TRow & string>,
): Provider => {
  return {
    provide: SecretRotationLifecycle,
    inject: [DataSource, cipherToken],
    useFactory: (dataSource: DataSource, cipher: SecretCipher) => {
      return new SecretRotationLifecycle(
        new SecretColumnRotator(dataSource, schema, columns, cipher),
      );
    },
  };
};
