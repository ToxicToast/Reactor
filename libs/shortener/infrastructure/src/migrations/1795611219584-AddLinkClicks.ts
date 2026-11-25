import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLinkClicks1795611219584 implements MigrationInterface {
  name = 'AddLinkClicks1795611219584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "link_clicks" ("event_id" uuid NOT NULL, "link_id" uuid NOT NULL, "clicked_at" TIMESTAMP WITH TIME ZONE NOT NULL, "referrer_host" character varying(253), "device" character varying(16) NOT NULL, "browser" character varying(16) NOT NULL, "country" character(2), CONSTRAINT "PK_ccc0bbe020f6a5c832940a92ced" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_link_clicks_link" ON "link_clicks"  ("link_id", "clicked_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_link_clicks_link"`);
    await queryRunner.query(`DROP TABLE "link_clicks"`);
  }
}
