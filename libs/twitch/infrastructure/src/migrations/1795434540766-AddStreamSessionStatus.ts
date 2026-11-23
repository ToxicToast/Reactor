import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreamSessionStatus1795434540766 implements MigrationInterface {
  name = 'AddStreamSessionStatus1795434540766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "title" character varying(140)`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "game_id" character varying(32)`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "game_name" character varying(256)`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "viewer_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "peak_viewers" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "viewer_samples" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" ADD "viewer_sum" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "viewer_sum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "viewer_samples"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "peak_viewers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "viewer_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "game_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "game_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitch_stream_sessions" DROP COLUMN "title"`,
    );
  }
}
