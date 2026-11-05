export type Game = 'botw' | 'totk';

export type Category = 'creatures' | 'equipment' | 'materials' | 'monsters' | 'treasure';

export const GAMES: readonly Game[] = ['botw', 'totk'];
export const CATEGORIES: readonly Category[] = [
  'creatures',
  'equipment',
  'materials',
  'monsters',
  'treasure',
];

interface BaseEntry {
  /** Compendium number. Unique within a game, NOT across games. */
  id: number;
  /** Lowercase English name, e.g. "water octorok". Unique within a game. */
  name: string;
  game: Game;
  /** Region names where this is commonly found. May be empty. */
  commonLocations: string[];
  /** True if the entry is DLC-only (BotW). */
  dlc: boolean;
}

export interface Creature extends BaseEntry {
  category: 'creatures';
  edible: boolean;
  drops: string[];
  /** Only present on edible creatures. */
  cookingEffect?: string;
  /** Only present on edible creatures. */
  heartsRecovered?: number;
}

export interface Equipment extends BaseEntry {
  category: 'equipment';
  /** `null` for items without a fixed value (e.g. arrows in BotW). */
  attack: number | null;
  defense: number | null;
  /** TotK only. */
  effect?: string;
  /** TotK only, e.g. "one-handed weapon". */
  type?: string;
}

export interface Material extends BaseEntry {
  category: 'materials';
  cookingEffect: string;
  heartsRecovered: number;
  /** TotK only: attack bonus when fused to a weapon. */
  fuseAttackPower?: number;
}

export interface Monster extends BaseEntry {
  category: 'monsters';
  drops: string[];
}

export interface Treasure extends BaseEntry {
  category: 'treasure';
  drops: string[];
}

export type Entry = Creature | Equipment | Material | Monster | Treasure;

export type EntryOfCategory<C extends Category> = Extract<Entry, { category: C }>;

export type Race =
  | 'hylian'
  | 'sheikah'
  | 'zora'
  | 'goron'
  | 'rito'
  | 'gerudo'
  | 'korok'
  | 'zonai'
  | 'fairy'
  | 'other';

export const RACES: readonly Race[] = [
  'hylian',
  'sheikah',
  'zora',
  'goron',
  'rito',
  'gerudo',
  'korok',
  'zonai',
  'fairy',
  'other',
];

/** A major named character. Not part of the Hyrule Compendium. */
export interface Npc {
  /** Lowercase English name, e.g. `'impa'`. */
  name: string;
  /** The games the character appears in. */
  games: Game[];
  race: Race;
}

/**
 * Translated entry and NPC names for one language. Import one from `hyrule-data/locales/<code>`
 * and pass it to `getName`, `getEntry` or `search`.
 */
export interface Locale {
  /** BCP 47 language code, e.g. `'zh-Hans'` or `'nl'`. */
  code: string;
  /** `true` when the names come from the games' official translation. */
  official: boolean;
  /**
   * English entry or NPC name (exactly as in the data, lowercase) → translated name.
   * Shared by BotW and TotK. Missing names fall back to English.
   */
  names: Readonly<Record<string, string>>;
}
