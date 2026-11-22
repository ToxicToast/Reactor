export const DATABASE_ENV = {
  HOST: 'DB_HOST',
  PORT: 'DB_PORT',
  USER: 'DB_USER',
  PASSWORD: 'DB_PASSWORD',
  NAME: 'DB_NAME',
} as const;

export const DATABASE_DEFAULTS = {
  PORT: 5432,
  MIGRATIONS_TABLE: 'migrations',
} as const;
