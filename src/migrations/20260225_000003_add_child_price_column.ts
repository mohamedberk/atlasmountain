import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Add tiered_pricing_child_price column to activities table
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS tiered_pricing_child_price numeric;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Remove tiered_pricing_child_price column
    ALTER TABLE activities DROP COLUMN IF EXISTS tiered_pricing_child_price;
  `)
}
