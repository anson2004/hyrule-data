import botwData from './data/botw.json';
import totkData from './data/totk.json';
import type { Category, Entry, EntryOfCategory, Game, Locale } from './types.js';

export * from './types.js';

const DATA: Record<Game, readonly Entry[]> = {
  botw: botwData as Entry[],
  totk: totkData as Entry[],
};

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

/** The entry's name in `locale`, or its English name when there is no translation. */
export function getName(entry: Entry, locale?: Locale): string {
  return translate(locale, entry.name) ?? entry.name;
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
  const wanted = normalizeName(idOrName);
  const english = options.locale ? englishNameFor(options.locale, idOrName) : undefined;
  return DATA[game].find((e) => e.name === wanted || e.name === english);
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
  const q = foldText(query);
  if (!q) return [];
  const { locale } = options;
  return DATA[game].filter((e) => {
    if (foldText(e.name).includes(q)) return true;
    const translated = translate(locale, e.name);
    return translated !== undefined && foldText(translated).includes(q);
  });
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
