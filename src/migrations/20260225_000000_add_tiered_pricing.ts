import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Add tiered_pricing_enabled column to activities table
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS tiered_pricing_enabled boolean DEFAULT false;

    -- Add tiered_pricing_child_price column to activities table
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS tiered_pricing_child_price numeric;

    -- Create tiered pricing tiers table
    CREATE TABLE IF NOT EXISTS activities_tiered_pricing_tiers (
      _order integer NOT NULL,
      _parent_id integer NOT NULL,
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      min_people integer NOT NULL,
      max_people integer NOT NULL,
      price_per_person numeric NOT NULL,
      CONSTRAINT activities_tiered_pricing_tiers_parent_id_fk
        FOREIGN KEY (_parent_id) REFERENCES activities(id) ON DELETE CASCADE
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS activities_tiered_pricing_tiers_parent_idx
      ON activities_tiered_pricing_tiers(_parent_id);

    CREATE INDEX IF NOT EXISTS activities_tiered_pricing_tiers_order_idx
      ON activities_tiered_pricing_tiers(_order);
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Remove tiered pricing
    DROP TABLE IF EXISTS activities_tiered_pricing_tiers;
    ALTER TABLE activities DROP COLUMN IF EXISTS tiered_pricing_enabled;
    ALTER TABLE activities DROP COLUMN IF EXISTS tiered_pricing_child_price;
  `)
}
