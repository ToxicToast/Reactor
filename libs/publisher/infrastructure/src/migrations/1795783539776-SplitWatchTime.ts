import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitWatchTime1795783539776 implements MigrationInterface {
  name = 'SplitWatchTime1795783539776';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" DROP COLUMN "watch_time_ms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" ADD "avg_watch_time_ms" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" ADD "total_watch_time_ms" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" DROP COLUMN "total_watch_time_ms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" DROP COLUMN "avg_watch_time_ms"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_snapshots" ADD "watch_time_ms" double precision`,
    );
  }
}
