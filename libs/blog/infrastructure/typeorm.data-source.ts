import { DataSource } from 'typeorm';
import { blogMigrations } from './src/migrations/index.js';
import { blogSchemas } from './src/schemas/index.js';

const env = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
};

export default new DataSource({
  type: 'postgres',
  host: env('BLOG_DB_HOST'),
  port: Number(process.env['BLOG_DB_PORT'] ?? 5432),
  username: env('BLOG_DB_USER'),
  password: env('BLOG_DB_PASSWORD'),
  database: env('BLOG_DB_NAME'),
  entities: blogSchemas,
  migrations: blogMigrations,
  migrationsTableName: 'migrations',
});
