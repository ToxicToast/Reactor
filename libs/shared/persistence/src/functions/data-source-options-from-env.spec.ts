import { dataSourceOptionsFromEnv } from './data-source-options-from-env.function.js';

const SOURCE: NodeJS.ProcessEnv = {
  DB_HOST: 'postgres-master',
  DB_USER: 'blog',
  DB_PASSWORD: 'secret',
  DB_NAME: 'blog',
};

describe('dataSourceOptionsFromEnv', () => {
  it('builds postgres options from the environment', () => {
    const options = dataSourceOptionsFromEnv(
      { schemas: [], migrations: [] },
      SOURCE,
    );

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'postgres-master',
      port: 5432,
      username: 'blog',
      password: 'secret',
      database: 'blog',
      migrationsTableName: 'migrations',
    });
  });

  it('fails on a missing variable', () => {
    const { DB_PASSWORD: _password, ...missing } = SOURCE;

    expect(() => {
      return dataSourceOptionsFromEnv({ schemas: [], migrations: [] }, missing);
    }).toThrow('DB_PASSWORD');
  });
});
