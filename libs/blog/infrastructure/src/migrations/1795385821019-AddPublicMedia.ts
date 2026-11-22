import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicMedia1795385821019 implements MigrationInterface {
  name = 'AddPublicMedia1795385821019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "public_media" ("media_id" uuid NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_ab0efe2db90bbf59d6ba5247119" PRIMARY KEY ("media_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "public_media"`);
  }
}
