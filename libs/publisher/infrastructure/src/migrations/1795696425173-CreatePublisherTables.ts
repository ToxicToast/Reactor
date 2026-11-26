import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePublisherTables1795696425173 implements MigrationInterface {
  name = 'CreatePublisherTables1795696425173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounts" ("platform" character varying(16) NOT NULL, "remote_id" character varying(64) NOT NULL, "handle" character varying(100) NOT NULL, "display_name" character varying(200), "url" text, CONSTRAINT "PK_bfb8cd3de29dd1556bba13fe1c6" PRIMARY KEY ("platform", "remote_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_snapshots" ("platform" character varying(16) NOT NULL, "remote_id" character varying(64) NOT NULL, "observed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "followers" integer, "media_count" integer, CONSTRAINT "PK_1f4af7210615b4e20c693d76049" PRIMARY KEY ("platform", "remote_id", "observed_at"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("platform" character varying(16) NOT NULL, "remote_id" character varying(64) NOT NULL, "account_remote_id" character varying(64) NOT NULL, "url" text NOT NULL, "title" character varying(300), "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_seconds" double precision, "origin" character varying(16) NOT NULL, CONSTRAINT "PK_2ebf514257f4e7274b89178b08a" PRIMARY KEY ("platform", "remote_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_posts_account" ON "posts"  ("platform", "account_remote_id", "published_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "post_snapshots" ("platform" character varying(16) NOT NULL, "remote_id" character varying(64) NOT NULL, "observed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "views" integer, "likes" integer, "comments" integer, "shares" integer, "saves" integer, "reach" integer, "watch_time_ms" double precision, "avg_view_percentage" double precision, "followers_gained" integer, CONSTRAINT "PK_701fe6bc8435f960bd8a6fdbdfc" PRIMARY KEY ("platform", "remote_id", "observed_at"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_checks" ("platform" character varying(16) NOT NULL, "remote_id" character varying(64) NOT NULL, "checked_at" TIMESTAMP WITH TIME ZONE NOT NULL, "failures" integer NOT NULL, "last_error" character varying(500), CONSTRAINT "PK_e3a119cf21312975487a416a396" PRIMARY KEY ("platform", "remote_id"))`,
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
    await queryRunner.query(`DROP TABLE "post_checks"`);
    await queryRunner.query(`DROP TABLE "post_snapshots"`);
    await queryRunner.query(`DROP INDEX "public"."idx_posts_account"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "account_snapshots"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}
