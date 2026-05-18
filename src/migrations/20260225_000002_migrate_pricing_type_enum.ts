import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Convert pricing_type column from enum to varchar temporarily
    ALTER TABLE activities
      ALTER COLUMN pricing_type TYPE varchar
      USING pricing_type::text;

    -- Drop the old enum type
    DROP TYPE IF EXISTS "public"."enum_activities_pricing_type";

    -- Create new enum with updated values
    CREATE TYPE "public"."enum_activities_pricing_type" AS ENUM ('tiered', 'custom_note', 'fixed');

    -- Map old values to new values
    UPDATE activities SET pricing_type = 'tiered' WHERE pricing_type = 'per_person';
    UPDATE activities SET pricing_type = 'tiered' WHERE pricing_type = 'both';
    UPDATE activities SET pricing_type = 'tiered' WHERE pricing_type IS NULL;

    -- Convert back to enum type
    ALTER TABLE activities
      ALTER COLUMN pricing_type TYPE "public"."enum_activities_pricing_type"
      USING pricing_type::"public"."enum_activities_pricing_type";

    -- Set default
    ALTER TABLE activities
      ALTER COLUMN pricing_type SET DEFAULT 'tiered';
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Convert pricing_type column from enum to varchar temporarily
    ALTER TABLE activities
      ALTER COLUMN pricing_type TYPE varchar
      USING pricing_type::text;

    -- Drop the new enum type
    DROP TYPE IF EXISTS "public"."enum_activities_pricing_type";

    -- Recreate old enum
    CREATE TYPE "public"."enum_activities_pricing_type" AS ENUM ('per_person', 'fixed', 'both');

    -- Map new values back to old values
    UPDATE activities SET pricing_type = 'per_person' WHERE pricing_type = 'tiered';
    UPDATE activities SET pricing_type = 'per_person' WHERE pricing_type = 'custom_note';

    -- Convert back to enum type
    ALTER TABLE activities
      ALTER COLUMN pricing_type TYPE "public"."enum_activities_pricing_type"
      USING pricing_type::"public"."enum_activities_pricing_type";
  `)
}
