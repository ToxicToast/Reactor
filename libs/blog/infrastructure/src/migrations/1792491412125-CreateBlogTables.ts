import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogTables1792491412125 implements MigrationInterface {
  name = 'CreateBlogTables1792491412125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tags" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "title" text NOT NULL, "slug" text NOT NULL, CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "title" text NOT NULL, "slug" text NOT NULL, "description" text, "parent_id" uuid, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_categories_parent" ON "categories"  ("parent_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "object_key" text NOT NULL, "filename" text NOT NULL, "mime_type" character varying(100) NOT NULL, "size" integer NOT NULL, "alt_text" text, "status" character varying(20) NOT NULL, CONSTRAINT "UQ_f5e482d57c690b64a71bd887439" UNIQUE ("object_key"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_media_status_created" ON "media"  ("status", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "author_id" uuid NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "excerpt" text, "content" text NOT NULL, "status" character varying(20) NOT NULL, "featured" boolean NOT NULL DEFAULT false, "reading_time" integer NOT NULL, "blog_image_id" uuid, "hero_image_id" uuid, "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_posts_status_published" ON "posts"  ("status", "published_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "post_categories" ("post_id" uuid NOT NULL, "category_id" uuid NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_4d9e522c51f13c52ad35813cf35" PRIMARY KEY ("post_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_categories_category" ON "post_categories"  ("category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "post_tags" ("post_id" uuid NOT NULL, "tag_id" uuid NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_deee54a40024b7afc16d25684f8" PRIMARY KEY ("post_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_tags_tag" ON "post_tags"  ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "post_id" uuid NOT NULL, "parent_id" uuid, "author_id" uuid NOT NULL, "content" text NOT NULL, "status" character varying(20) NOT NULL, "moderation_note" text, "moderated_by" character varying(20), "moderated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_comments_post_status" ON "comments"  ("post_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_comments_status_created" ON "comments"  ("status", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "outbox" ("event_id" uuid NOT NULL, "event_namespace" character varying(100) NOT NULL, "event_name" character varying(100) NOT NULL, "event_version" integer NOT NULL, "aggregate_id" character varying(64) NOT NULL, "payload" jsonb NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE, "attempts" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cc0c9e40998e45ecfc5e313429d" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_outbox_unpublished" ON "outbox"  ("occurred_at") WHERE published_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_outbox_unpublished"`);
    await queryRunner.query(`DROP TABLE "outbox"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_comments_status_created"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_comments_post_status"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP INDEX "public"."idx_post_tags_tag"`);
    await queryRunner.query(`DROP TABLE "post_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_post_categories_category"`,
    );
    await queryRunner.query(`DROP TABLE "post_categories"`);
    await queryRunner.query(`DROP INDEX "public"."idx_posts_status_published"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP INDEX "public"."idx_media_status_created"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP INDEX "public"."idx_categories_parent"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
