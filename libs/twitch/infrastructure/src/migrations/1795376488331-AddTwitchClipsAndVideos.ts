import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchClipsAndVideos1795376488331 implements MigrationInterface {
  name = 'AddTwitchClipsAndVideos1795376488331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_clips" ("clip_id" character varying(64) NOT NULL, "channel_id" character varying(32) NOT NULL, "url" text NOT NULL, "title" character varying(200) NOT NULL, "creator_id" character varying(32) NOT NULL, "creator_name" character varying(64) NOT NULL, "duration_seconds" real NOT NULL, "thumbnail_url" text NOT NULL, "vod_id" character varying(64), "vod_offset" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_bceab24595c3139049a1f3bb219" PRIMARY KEY ("clip_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_clips_channel" ON "twitch_clips"  ("channel_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_clips_vod" ON "twitch_clips"  ("vod_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "twitch_videos" ("video_id" character varying(64) NOT NULL, "channel_id" character varying(32) NOT NULL, "stream_id" character varying(64), "type" character varying(20) NOT NULL, "title" character varying(200) NOT NULL, "description" text NOT NULL, "url" text NOT NULL, "thumbnail_url" text NOT NULL, "duration_seconds" integer NOT NULL, "language" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_32f01811c9bf589f10911529f1d" PRIMARY KEY ("video_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_videos_channel" ON "twitch_videos"  ("channel_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_videos_stream" ON "twitch_videos"  ("stream_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_videos_stream"`);
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_videos_channel"`);
    await queryRunner.query(`DROP TABLE "twitch_videos"`);
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_clips_vod"`);
    await queryRunner.query(`DROP INDEX "public"."idx_twitch_clips_channel"`);
    await queryRunner.query(`DROP TABLE "twitch_clips"`);
  }
}
