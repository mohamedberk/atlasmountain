import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Add custom_pricing_note_note column to activities table
    ALTER TABLE activities ADD COLUMN IF NOT EXISTS custom_pricing_note_note text;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Remove custom_pricing_note_note column
    ALTER TABLE activities DROP COLUMN IF EXISTS custom_pricing_note_note;
  `)
}
