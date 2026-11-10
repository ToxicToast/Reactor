import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTwitchChatMessages1793294888797 implements MigrationInterface {
  name = 'AddTwitchChatMessages1793294888797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitch_chat_messages" ("message_id" character varying(64) NOT NULL, "channel_id" character varying(32) NOT NULL, "user_id" character varying(32) NOT NULL, "user_login" character varying(25) NOT NULL, "user_name" character varying(64) NOT NULL, "text" text NOT NULL, "color" character varying(20), "badges" text array NOT NULL, "bits" integer NOT NULL DEFAULT '0', "reply_to_message_id" character varying(64), "session_id" uuid, "sent_at" TIMESTAMP WITH TIME ZONE NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_reason" character varying(20), CONSTRAINT "PK_a53b92300b770b0fcf36c5a6c23" PRIMARY KEY ("message_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_chat_messages_channel" ON "twitch_chat_messages"  ("channel_id", "sent_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_chat_messages_user" ON "twitch_chat_messages"  ("channel_id", "user_id", "sent_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_twitch_chat_messages_session" ON "twitch_chat_messages"  ("session_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_twitch_chat_messages_session"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_twitch_chat_messages_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_twitch_chat_messages_channel"`,
    );
    await queryRunner.query(`DROP TABLE "twitch_chat_messages"`);
  }
}
