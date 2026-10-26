import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSecurityTables1792875051789 implements MigrationInterface {
  name = 'CreateSecurityTables1792875051789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ip_bans" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "ip" character varying(45) NOT NULL, "level" integer NOT NULL, "failed_attempts" integer NOT NULL, "banned_until" TIMESTAMP WITH TIME ZONE NOT NULL, "lifted_at" TIMESTAMP WITH TIME ZONE, "lifted_by" character varying(64), CONSTRAINT "PK_311204de0c3f5643def7746a27b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ip_bans_ip_created" ON "ip_bans"  ("ip", "created_at") `,
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
    await queryRunner.query(`DROP INDEX "public"."idx_ip_bans_ip_created"`);
    await queryRunner.query(`DROP TABLE "ip_bans"`);
  }
}
