import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add rating fields to activities table
  await db.execute(sql`
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "overall_rating" numeric;
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "total_reviews" numeric;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove rating fields from activities table
  await db.execute(sql`
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "overall_rating";
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "total_reviews";
  `)
}
