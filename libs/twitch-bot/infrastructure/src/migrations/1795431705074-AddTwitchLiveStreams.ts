import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchLiveStreams1795431705074 implements MigrationInterface {
  name = 'AddTwitchLiveStreams1795431705074';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_live_streams" ("channel_id" uuid NOT NULL, "stream_id" character varying(64) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7d8422aaf49d99ac4c171981c79" PRIMARY KEY ("channel_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "twitch_live_streams"`);
  }
}
