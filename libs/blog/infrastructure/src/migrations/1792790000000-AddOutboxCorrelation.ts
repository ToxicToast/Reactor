import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutboxCorrelation1792790000000 implements MigrationInterface {
  name = 'AddOutboxCorrelation1792790000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "outbox" ADD "correlation_id" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "outbox" DROP COLUMN "correlation_id"`,
    );
  }
}
