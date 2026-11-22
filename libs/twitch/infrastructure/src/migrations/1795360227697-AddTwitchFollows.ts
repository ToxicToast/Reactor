import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchFollows1795360227697 implements MigrationInterface {
  name = 'AddTwitchFollows1795360227697';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_follows" ("channel_id" character varying(32) NOT NULL, "user_id" character varying(32) NOT NULL, "user_login" character varying(25) NOT NULL, "user_name" character varying(64) NOT NULL, "followed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "unfollowed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3a655e6e7e1db3ea4905a0a7f9a" PRIMARY KEY ("channel_id", "user_id", "followed_at"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_twitch_follows_open" ON "twitch_follows" ("channel_id", "user_id") WHERE "unfollowed_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_follows_channel" ON "twitch_follows" ("channel_id", "followed_at")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_follows_channel"`);
    await queryRunner.query(`DROP INDEX "public"."uq_twitch_follows_open"`);
    await queryRunner.query(`DROP TABLE "twitch_follows"`);
  }
}
