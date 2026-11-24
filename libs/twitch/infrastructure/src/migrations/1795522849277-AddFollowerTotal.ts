import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowerTotal1795522849277 implements MigrationInterface {
  name = 'AddFollowerTotal1795522849277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitch_channel_days" ADD "follower_total" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitch_channel_days" DROP COLUMN "follower_total"`,
    );
  }
}
