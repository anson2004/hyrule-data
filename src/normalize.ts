import type { Entry, Game } from './types.js';

/** Raw entry shape as returned by the Hyrule Compendium API v3. */
export interface RawEntry {
  id: number;
  name: string;
  category: string;
  description?: string;
  image?: string;
  common_locations?: string[] | null;
  dlc?: boolean;
  drops?: string[] | null;
  edible?: boolean;
  cooking_effect?: string;
  hearts_recovered?: number;
  fuse_attack_power?: number;
  properties?: {
    attack?: number | null;
    defense?: number | null;
    effect?: string;
    type?: string;
  };
}

const optional = <K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> =>
  value === undefined ? {} : ({ [key]: value } as Record<K, V>);

/**
 * Converts a raw API entry into the package's facts-only shape.
 * Descriptions and images are intentionally dropped (see NOTICE.md).
 */
export function normalize(raw: RawEntry, game: Game): Entry {
  const base = {
    id: raw.id,
    name: raw.name,
    game,
    commonLocations: raw.common_locations ?? [],
    dlc: raw.dlc ?? false,
  };

  switch (raw.category) {
    case 'creatures':
      return {
        ...base,
        category: 'creatures',
        edible: raw.edible ?? false,
        drops: raw.drops ?? [],
        ...optional('cookingEffect', raw.cooking_effect),
        ...optional('heartsRecovered', raw.hearts_recovered),
      };
    case 'equipment':
      return {
        ...base,
        category: 'equipment',
        attack: raw.properties?.attack ?? null,
        defense: raw.properties?.defense ?? null,
        ...optional('effect', raw.properties?.effect),
        ...optional('type', raw.properties?.type),
      };
    case 'materials':
      return {
        ...base,
        category: 'materials',
        cookingEffect: raw.cooking_effect ?? '',
        heartsRecovered: raw.hearts_recovered ?? 0,
        ...optional('fuseAttackPower', raw.fuse_attack_power),
      };
    case 'monsters':
    case 'treasure':
      return { ...base, category: raw.category, drops: raw.drops ?? [] };
    default:
      throw new Error(`Unknown category "${raw.category}" for entry ${raw.id} (${raw.name})`);
  }
}
