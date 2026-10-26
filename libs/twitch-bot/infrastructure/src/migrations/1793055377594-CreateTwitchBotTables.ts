import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTwitchBotTables1793055377594 implements MigrationInterface {
  name = 'CreateTwitchBotTables1793055377594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_channels" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "twitch_id" character varying(32) NOT NULL, "login" character varying(25) NOT NULL, "display_name" character varying(64) NOT NULL, "scopes" text array NOT NULL, "connected" boolean NOT NULL, CONSTRAINT "uq_twitch_channels_twitch_id" UNIQUE ("twitch_id"), CONSTRAINT "PK_b4c640590a3e25ba59b3e6371f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_tokens" ("channel_id" uuid NOT NULL, "access_token" text NOT NULL, "refresh_token" text, "scopes" text array NOT NULL, "expires_in" integer, "obtained_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5a305dbd55ca4b7ba3cc9ced612" PRIMARY KEY ("channel_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_chatters" ("channel_id" uuid NOT NULL, "user_id" character varying(32) NOT NULL, "user_login" character varying(25) NOT NULL, "user_name" character varying(64) NOT NULL, CONSTRAINT "PK_9b71dabfc63493fee8d44d3619f" PRIMARY KEY ("channel_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_published_clips" ("channel_id" uuid NOT NULL, "clip_id" character varying(128) NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_685c1b8920d9c0a1d7b30da7b9f" PRIMARY KEY ("channel_id", "clip_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "outbox" ("event_id" uuid NOT NULL, "event_namespace" character varying(100) NOT NULL, "event_name" character varying(100) NOT NULL, "event_version" integer NOT NULL, "aggregate_id" character varying(64) NOT NULL, "actor_type" character varying(20) NOT NULL, "actor_id" character varying(64), "actor_ip" character varying(45), "correlation_id" uuid, "payload" jsonb NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, "attempts" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cc0c9e40998e45ecfc5e313429d" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_outbox_unpublished" ON "outbox"  ("occurred_at") WHERE published_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_outbox_unpublished"`);
    await queryRunner.query(`DROP TABLE "outbox"`);
    await queryRunner.query(`DROP TABLE "twitch_published_clips"`);
    await queryRunner.query(`DROP TABLE "twitch_chatters"`);
    await queryRunner.query(`DROP TABLE "twitch_tokens"`);
    await queryRunner.query(`DROP TABLE "twitch_channels"`);
  }
}
