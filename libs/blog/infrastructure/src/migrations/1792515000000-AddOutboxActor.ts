import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutboxActor1792515000000 implements MigrationInterface {
  name = 'AddOutboxActor1792515000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outbox" ADD "actor_type" character varying(20) NOT NULL DEFAULT 'system'`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbox" ALTER COLUMN "actor_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbox" ADD "actor_id" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "outbox" ADD "actor_ip" character varying(45)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "outbox" DROP COLUMN "actor_ip"`);
    await queryRunner.query(`ALTER TABLE "outbox" DROP COLUMN "actor_id"`);
    await queryRunner.query(`ALTER TABLE "outbox" DROP COLUMN "actor_type"`);
  }
}
