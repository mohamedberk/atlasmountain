import * as migration_20260110_110436_add_uploadthing_keys from './20260110_110436_add_uploadthing_keys';
import * as migration_20260127_174500_add_route_selected_route_fields from './20260127_174500_add_route_selected_route_fields';
import * as migration_20260128_000000_add_waypoints_array from './20260128_000000_add_waypoints_array';
import * as migration_20260131_000000_add_rating_fields from './20260131_000000_add_rating_fields';
import * as migration_20260225_000000_add_tiered_pricing from './20260225_000000_add_tiered_pricing';
import * as migration_20260225_000001_update_pricing_structure from './20260225_000001_update_pricing_structure';
import * as migration_20260225_000002_migrate_pricing_type_enum from './20260225_000002_migrate_pricing_type_enum';
import * as migration_20260225_000003_add_child_price_column from './20260225_000003_add_child_price_column';
import * as migration_20260225_000004_add_custom_pricing_note from './20260225_000004_add_custom_pricing_note';

export const migrations = [
  {
    up: migration_20260110_110436_add_uploadthing_keys.up,
    down: migration_20260110_110436_add_uploadthing_keys.down,
    name: '20260110_110436_add_uploadthing_keys'
  },
  {
    up: migration_20260127_174500_add_route_selected_route_fields.up,
    down: migration_20260127_174500_add_route_selected_route_fields.down,
    name: '20260127_174500_add_route_selected_route_fields'
  },
  {
    up: migration_20260128_000000_add_waypoints_array.up,
    down: migration_20260128_000000_add_waypoints_array.down,
    name: '20260128_000000_add_waypoints_array'
  },
  {
    up: migration_20260131_000000_add_rating_fields.up,
    down: migration_20260131_000000_add_rating_fields.down,
    name: '20260131_000000_add_rating_fields'
  },
  {
    up: migration_20260225_000000_add_tiered_pricing.up,
    down: migration_20260225_000000_add_tiered_pricing.down,
    name: '20260225_000000_add_tiered_pricing'
  },
  {
    up: migration_20260225_000001_update_pricing_structure.up,
    down: migration_20260225_000001_update_pricing_structure.down,
    name: '20260225_000001_update_pricing_structure'
  },
  {
    up: migration_20260225_000002_migrate_pricing_type_enum.up,
    down: migration_20260225_000002_migrate_pricing_type_enum.down,
    name: '20260225_000002_migrate_pricing_type_enum'
  },
  {
    up: migration_20260225_000003_add_child_price_column.up,
    down: migration_20260225_000003_add_child_price_column.down,
    name: '20260225_000003_add_child_price_column'
  },
  {
    up: migration_20260225_000004_add_custom_pricing_note.up,
    down: migration_20260225_000004_add_custom_pricing_note.down,
    name: '20260225_000004_add_custom_pricing_note'
  },
];
