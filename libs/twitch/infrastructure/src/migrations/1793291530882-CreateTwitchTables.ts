import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTwitchTables1793291530882 implements MigrationInterface {
  name = 'CreateTwitchTables1793291530882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_stream_sessions" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "channel_id" character varying(32) NOT NULL, "channel_login" character varying(25) NOT NULL, "channel_name" character varying(64) NOT NULL, "stream_id" character varying(64) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ended_at" TIMESTAMP WITH TIME ZONE, "duration_seconds" integer, "messages" integer NOT NULL DEFAULT '0', "follows" integer NOT NULL DEFAULT '0', "subscriptions" integer NOT NULL DEFAULT '0', "resubscriptions" integer NOT NULL DEFAULT '0', "gifted_subs" integer NOT NULL DEFAULT '0', "bits" integer NOT NULL DEFAULT '0', "raids" integer NOT NULL DEFAULT '0', "raid_viewers" integer NOT NULL DEFAULT '0', "redemptions" integer NOT NULL DEFAULT '0', "peak_chatters" integer NOT NULL DEFAULT '0', "unique_chatters" integer NOT NULL DEFAULT '0', CONSTRAINT "uq_twitch_stream_sessions_stream" UNIQUE ("channel_id", "stream_id"), CONSTRAINT "PK_d5c50e3b729188345f98045d590" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_twitch_stream_sessions_live" ON "twitch_stream_sessions"  ("channel_id") WHERE ended_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_stream_sessions_channel" ON "twitch_stream_sessions"  ("channel_id", "started_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_channel_days" ("channel_id" character varying(32) NOT NULL, "day" date NOT NULL, "messages" integer NOT NULL DEFAULT '0', "follows" integer NOT NULL DEFAULT '0', "subscriptions" integer NOT NULL DEFAULT '0', "resubscriptions" integer NOT NULL DEFAULT '0', "gifted_subs" integer NOT NULL DEFAULT '0', "bits" integer NOT NULL DEFAULT '0', "raids" integer NOT NULL DEFAULT '0', "raid_viewers" integer NOT NULL DEFAULT '0', "redemptions" integer NOT NULL DEFAULT '0', "stream_seconds" integer NOT NULL DEFAULT '0', "unique_chatters" integer NOT NULL DEFAULT '0', "peak_chatters" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_e34d6beb5e8f7ae31e07da7457e" PRIMARY KEY ("channel_id", "day"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_viewers" ("channel_id" character varying(32) NOT NULL, "user_id" character varying(32) NOT NULL, "user_login" character varying(25) NOT NULL, "user_name" character varying(64) NOT NULL, "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_ff95340c836d272f11393f65104" PRIMARY KEY ("channel_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_viewer_days" ("channel_id" character varying(32) NOT NULL, "user_id" character varying(32) NOT NULL, "day" date NOT NULL, "messages" integer NOT NULL DEFAULT '0', "watch_seconds" integer NOT NULL DEFAULT '0', "bits" integer NOT NULL DEFAULT '0', "gifted_subs" integer NOT NULL DEFAULT '0', "redemptions" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2951701edf7c7100cef641e14bf" PRIMARY KEY ("channel_id", "user_id", "day"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_viewer_days_channel" ON "twitch_viewer_days"  ("channel_id", "day") `,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_chatter_days" ("channel_id" character varying(32) NOT NULL, "day" date NOT NULL, "user_id" character varying(32) NOT NULL, CONSTRAINT "PK_53c9ec5c2d863be8363203ac53e" PRIMARY KEY ("channel_id", "day", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_session_chatters" ("session_id" uuid NOT NULL, "user_id" character varying(32) NOT NULL, CONSTRAINT "PK_5cb41b13aa96d07eef62c660c42" PRIMARY KEY ("session_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_presence" ("channel_id" character varying(32) NOT NULL, "user_id" character varying(32) NOT NULL, "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_dfdd1914768bef1ce0a50d6146e" PRIMARY KEY ("channel_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_rewards" ("channel_id" character varying(32) NOT NULL, "reward_id" character varying(64) NOT NULL, "title" character varying(200) NOT NULL, "cost" integer NOT NULL, CONSTRAINT "PK_8d1e3c890dc8e072cc476ec2ed9" PRIMARY KEY ("channel_id", "reward_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_reward_days" ("channel_id" character varying(32) NOT NULL, "reward_id" character varying(64) NOT NULL, "day" date NOT NULL, "redemptions" integer NOT NULL DEFAULT '0', "points_spent" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_214894086e6423b7edf02b7e2f2" PRIMARY KEY ("channel_id", "reward_id", "day"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_polls" ("poll_id" character varying(64) NOT NULL, "channel_id" character varying(32) NOT NULL, "title" character varying(200) NOT NULL, "choices" jsonb NOT NULL, "status" character varying(20) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE, "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_80a3e8d4948aa9abd025c679c1f" PRIMARY KEY ("poll_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_polls_channel" ON "twitch_polls"  ("channel_id", "started_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_known_channels" ("channel_id" character varying(32) NOT NULL, "channel_login" character varying(25) NOT NULL, "channel_name" character varying(64) NOT NULL, "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8407c46d26c80a9b77abea35762" PRIMARY KEY ("channel_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_events" ("event_id" character varying(64) NOT NULL, "topic" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "channel_id" character varying(32) NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" jsonb NOT NULL, CONSTRAINT "PK_21540431d18b5296ce3b99d021e" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_events_channel" ON "twitch_events"  ("channel_id", "occurred_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "outbox" ("event_id" uuid NOT NULL, "event_namespace" character varying(100) NOT NULL, "event_name" character varying(100) NOT NULL, "event_version" integer NOT NULL, "aggregate_id" character varying(64) NOT NULL, "actor_type" character varying(20) NOT NULL, "actor_id" character varying(64), "actor_ip" character varying(45), "correlation_id" uuid, "payload" jsonb NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, "attempts" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cc0c9e40998e45ecfc5e313429d" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_outbox_unpublished" ON "outbox"  ("occurred_at") WHERE published_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "webhooks" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "url" character varying(2048) NOT NULL, "events" text array NOT NULL, "description" character varying(200), "active" boolean NOT NULL, "format" character varying(20) NOT NULL, "secret" text NOT NULL, CONSTRAINT "PK_9e8795cfc899ab7bdaa831e8527" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_deliveries" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "webhook_id" uuid NOT NULL, "event_id" character varying(64) NOT NULL, "event_key" character varying(200) NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" jsonb NOT NULL, "status" character varying(20) NOT NULL, "attempts" integer NOT NULL, "last_status_code" integer, "last_error" character varying(500), "next_attempt_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "uq_webhook_deliveries_webhook_event" UNIQUE ("webhook_id", "event_id"), CONSTRAINT "PK_535dd409947fb6d8fc6dfc0112a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_webhook_deliveries_due" ON "webhook_deliveries"  ("next_attempt_at") WHERE status = 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_webhook_deliveries_webhook" ON "webhook_deliveries"  ("webhook_id", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_webhook_deliveries_webhook"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_webhook_deliveries_due"`);
    await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
    await queryRunner.query(`DROP TABLE "webhooks"`);
    await queryRunner.query(`DROP INDEX "public"."idx_outbox_unpublished"`);
    await queryRunner.query(`DROP TABLE "outbox"`);
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_events_channel"`);
    await queryRunner.query(`DROP TABLE "twitch_events"`);
    await queryRunner.query(`DROP TABLE "twitch_known_channels"`);
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_polls_channel"`);
    await queryRunner.query(`DROP TABLE "twitch_polls"`);
    await queryRunner.query(`DROP TABLE "twitch_reward_days"`);
    await queryRunner.query(`DROP TABLE "twitch_rewards"`);
    await queryRunner.query(`DROP TABLE "twitch_presence"`);
    await queryRunner.query(`DROP TABLE "twitch_session_chatters"`);
    await queryRunner.query(`DROP TABLE "twitch_chatter_days"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_twitch_viewer_days_channel"`,
    );
    await queryRunner.query(`DROP TABLE "twitch_viewer_days"`);
    await queryRunner.query(`DROP TABLE "twitch_viewers"`);
    await queryRunner.query(`DROP TABLE "twitch_channel_days"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_twitch_stream_sessions_channel"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."uq_twitch_stream_sessions_live"`,
    );
    await queryRunner.query(`DROP TABLE "twitch_stream_sessions"`);
  }
}
