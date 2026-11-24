import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchFriends1795427079734 implements MigrationInterface {
  name = 'AddTwitchFriends1795427079734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_friends" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "twitch_id" character varying(32) NOT NULL, "login" character varying(25) NOT NULL, "display_name" character varying(64) NOT NULL, CONSTRAINT "uq_twitch_friends_twitch_id" UNIQUE ("twitch_id"), CONSTRAINT "PK_8ff276a513c3ef93121e322239a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "twitch_friends"`);
  }
}
