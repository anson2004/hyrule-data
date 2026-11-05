import botwData from './data/botw.json';
import totkData from './data/totk.json';
import npcData from './data/npcs.json';
import type { Category, Entry, EntryOfCategory, Game, Locale, Npc, Race } from './types.js';

export * from './types.js';

const DATA: Record<Game, readonly Entry[]> = {
  botw: botwData as Entry[],
  totk: totkData as Entry[],
};

const NPCS = npcData as Npc[];

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/[\s_-]+/g, ' ');

/**
 * Looser normalization for search: also folds full-width characters (NFKC) and
 * strips Latin accents, so "Lynél" matches "lynel" and "ＬＹＮＥＬ" matches too.
 */
const foldText = (text: string) =>
  normalizeName(text.normalize('NFKC'))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');

/** Options for functions that understand translated names. */
export interface LocaleOptions {
  /** Also match (and prefer) names in this language. */
  locale?: Locale;
}

/** Folded translated name → English name, built once per locale. */
const reverseIndex = new WeakMap<Locale, Map<string, string>>();
function englishNameFor(locale: Locale, translated: string): string | undefined {
  let index = reverseIndex.get(locale);
  if (!index) {
    index = new Map(Object.entries(locale.names).map(([en, local]) => [foldText(local), en]));
    reverseIndex.set(locale, index);
  }
  return index.get(foldText(translated));
}

/** The entry's or NPC's name in `locale`, or its English name when there is no translation. */
export function getName(item: Entry | Npc, locale?: Locale): string {
  return translate(locale, item.name) ?? item.name;
}

function translate(locale: Locale | undefined, englishName: string): string | undefined {
  return locale && Object.hasOwn(locale.names, englishName) ? locale.names[englishName] : undefined;
}

/** All bundled entries for a game, optionally limited to one category. Works offline. */
export function getEntries(game: Game): readonly Entry[];
export function getEntries<C extends Category>(game: Game, category: C): readonly EntryOfCategory<C>[];
export function getEntries(game: Game, category?: Category): readonly Entry[] {
  assertGame(game);
  const all = DATA[game];
  return category ? all.filter((e) => e.category === category) : all;
}

/**
 * Looks up one entry by compendium id or name (case-insensitive; "_" and "-" match spaces).
 * With `{ locale }`, an exact translated name also works.
 */
export function getEntry(
  game: Game,
  idOrName: number | string,
  options: LocaleOptions = {},
): Entry | undefined {
  assertGame(game);
  if (typeof idOrName === 'number') return DATA[game].find((e) => e.id === idOrName);
  return findByName(DATA[game], idOrName, options.locale);
}

export const getMonsters = (game: Game) => getEntries(game, 'monsters');
export const getCreatures = (game: Game) => getEntries(game, 'creatures');
export const getMaterials = (game: Game) => getEntries(game, 'materials');
export const getEquipment = (game: Game) => getEntries(game, 'equipment');
export const getTreasure = (game: Game) => getEntries(game, 'treasure');

/**
 * Entries whose name contains `query`. Ignores case, accents and full-width characters.
 * With `{ locale }`, translated names are searched too.
 */
export function search(game: Game, query: string, options: LocaleOptions = {}): Entry[] {
  assertGame(game);
  return searchByName(DATA[game], query, options.locale);
}

function findByName<T extends { name: string }>(items: readonly T[], name: string, locale?: Locale) {
  const wanted = normalizeName(name);
  const english = locale ? englishNameFor(locale, name) : undefined;
  return items.find((item) => item.name === wanted || item.name === english);
}

function searchByName<T extends { name: string }>(items: readonly T[], query: string, locale?: Locale) {
  const q = foldText(query);
  if (!q) return [];
  return items.filter((item) => {
    if (foldText(item.name).includes(q)) return true;
    const translated = translate(locale, item.name);
    return translated !== undefined && foldText(translated).includes(q);
  });
}

/** Major named characters in a game, optionally limited to one race. Works offline. */
export function getNpcs(game: Game, race?: Race): Npc[] {
  assertGame(game);
  return NPCS.filter((n) => n.games.includes(game) && (!race || n.race === race));
}

/** Looks up one NPC by English name (case-insensitive), or by translated name with `{ locale }`. */
export function getNpc(game: Game, name: string, options: LocaleOptions = {}): Npc | undefined {
  return findByName(getNpcs(game), name, options.locale);
}

/** NPCs whose name contains `query`. Same matching rules as `search`. */
export function searchNpcs(game: Game, query: string, options: LocaleOptions = {}): Npc[] {
  return searchByName(getNpcs(game), query, options.locale);
}

/** Monsters, creatures and treasure that drop the given item. */
export function findByDrop(game: Game, item: string): Entry[] {
  assertGame(game);
  const wanted = normalizeName(item);
  return DATA[game].filter((e) => 'drops' in e && e.drops.includes(wanted));
}

/** Entries commonly found in the given region (case-insensitive exact match). */
export function findByLocation(game: Game, region: string): Entry[] {
  assertGame(game);
  const wanted = region.trim().toLowerCase();
  return DATA[game].filter((e) => e.commonLocations.some((l) => l.toLowerCase() === wanted));
}

/** Every distinct region name that appears in `commonLocations`, sorted. */
export function getLocations(game: Game): string[] {
  assertGame(game);
  return [...new Set(DATA[game].flatMap((e) => e.commonLocations))].sort();
}

function assertGame(game: string): asserts game is Game {
  if (!(game in DATA)) throw new TypeError(`Unknown game "${game}". Expected "botw" or "totk".`);
}
