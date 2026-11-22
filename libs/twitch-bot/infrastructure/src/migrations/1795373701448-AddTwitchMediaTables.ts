import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchMediaTables1795373701448 implements MigrationInterface {
  name = 'AddTwitchMediaTables1795373701448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_published_videos" ("channel_id" uuid NOT NULL, "video_id" character varying(64) NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_24f43c324dbbdcb5e04b428848c" PRIMARY KEY ("channel_id", "video_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_media_imports" ("channel_id" uuid NOT NULL, "imported_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d33d62beef9a186c8be030d4da3" PRIMARY KEY ("channel_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "twitch_media_imports"`);
    await queryRunner.query(`DROP TABLE "twitch_published_videos"`);
  }
}
