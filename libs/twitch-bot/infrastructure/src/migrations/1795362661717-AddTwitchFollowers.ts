import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchFollowers1795362661717 implements MigrationInterface {
  name = 'AddTwitchFollowers1795362661717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_followers" ("channel_id" uuid NOT NULL, "user_id" character varying(32) NOT NULL, "user_login" character varying(25) NOT NULL, "user_name" character varying(64) NOT NULL, "followed_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_9e529eabee756b49eddce70c219" PRIMARY KEY ("channel_id", "user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "twitch_followers"`);
  }
}
