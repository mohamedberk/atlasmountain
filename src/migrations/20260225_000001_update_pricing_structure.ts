import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Rename min_people to number_of_people in tiered pricing tiers
    ALTER TABLE activities_tiered_pricing_tiers
      RENAME COLUMN min_people TO number_of_people;

    -- Make max_people nullable (for single person tiers)
    ALTER TABLE activities_tiered_pricing_tiers
      ALTER COLUMN max_people DROP NOT NULL;

    -- Add custom pricing note field to activities table (non-localized field)
    ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS custom_pricing_note_note text;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Revert changes
    ALTER TABLE activities
      DROP COLUMN IF EXISTS custom_pricing_note_note;

    ALTER TABLE activities_tiered_pricing_tiers
      RENAME COLUMN number_of_people TO min_people;

    ALTER TABLE activities_tiered_pricing_tiers
      ALTER COLUMN max_people SET NOT NULL;
  `)
}
