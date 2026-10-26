import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditTables1793044432268 implements MigrationInterface {
  name = 'CreateAuditTables1793044432268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_events" ("event_id" uuid NOT NULL, "event_namespace" character varying(100) NOT NULL, "event_name" character varying(100) NOT NULL, "event_version" integer NOT NULL, "aggregate_id" character varying(64) NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "actor_type" character varying(20) NOT NULL, "actor_id" character varying(64), "actor_ip" character varying(45), "correlation_id" uuid, "payload" jsonb NOT NULL, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_c51af20537d07624e00f371d43f" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_events_occurred" ON "audit_events"  ("occurred_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_events_correlation" ON "audit_events"  ("correlation_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_events_actor" ON "audit_events"  ("actor_id", "occurred_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_events_aggregate" ON "audit_events"  ("aggregate_id", "occurred_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_events_namespace" ON "audit_events"  ("event_namespace", "occurred_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_audit_events_namespace"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_events_aggregate"`);
    await queryRunner.query(`DROP INDEX "public"."idx_audit_events_actor"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_audit_events_correlation"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_audit_events_occurred"`);
    await queryRunner.query(`DROP TABLE "audit_events"`);
  }
}
