import type { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenWebhookUrl1794380000000 implements MigrationInterface {
  name = 'WidenWebhookUrl1794380000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhooks" ALTER COLUMN "url" TYPE text`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhooks" ALTER COLUMN "url" TYPE character varying(2048)`,
    );
  }
}
