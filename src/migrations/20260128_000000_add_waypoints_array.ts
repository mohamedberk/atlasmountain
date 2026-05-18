import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create the waypoints array table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "activities_route_waypoints" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar,
      "coordinates_latitude" numeric,
      "coordinates_longitude" numeric
    );
  `)

  // Add index for parent relationship
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "activities_route_waypoints_order_idx" ON "activities_route_waypoints" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "activities_route_waypoints_parent_id_idx" ON "activities_route_waypoints" USING btree ("_parent_id");
  `)

  // Add foreign key constraint
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "activities_route_waypoints" ADD CONSTRAINT "activities_route_waypoints_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "activities"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  // Drop old startLocation and endLocation columns if they exist
  await db.execute(sql`
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "route_start_location_id";
    ALTER TABLE "activities" DROP COLUMN IF EXISTS "route_end_location_id";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop the waypoints table
  await db.execute(sql`
    DROP TABLE IF EXISTS "activities_route_waypoints";
  `)

  // Re-add the old columns (but data will be lost)
  await db.execute(sql`
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "route_start_location_id" integer;
    ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "route_end_location_id" integer;
  `)
}
