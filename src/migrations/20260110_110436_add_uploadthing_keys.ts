import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add UploadThing _key columns to media table for cloud storage tracking
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_key" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail__key" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card__key" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero__key" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove UploadThing _key columns from media table
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "_key";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail__key";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card__key";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero__key";
  `)
}
