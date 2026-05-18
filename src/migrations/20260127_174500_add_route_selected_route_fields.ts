import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add selectedRoute fields to activities table for storing the selected route geometry
  await db.execute(sql`
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "route_selected_route_geometry" text;
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "route_selected_route_distance" numeric;
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "route_selected_route_duration" numeric;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Remove selectedRoute fields from activities table
  await db.execute(sql`
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "route_selected_route_geometry";
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "route_selected_route_distance";
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "route_selected_route_duration";
  `)
}
