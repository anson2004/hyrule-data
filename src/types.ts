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
