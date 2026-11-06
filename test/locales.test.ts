import { describe, expect, it } from 'vitest';
import {
  GAMES,
  getEntries,
  getEntry,
  getName,
  getNpc,
  getNpcs,
  search,
  searchNpcs,
  type Locale,
} from '../src/index.js';
import { nl } from '../src/locales/nl.js';
import { zh } from '../src/locales/zh.js';

const LOCALES = [zh, nl];
const englishNames = new Set(
  GAMES.flatMap((g) => [...getEntries(g), ...getNpcs(g)].map((e) => e.name)),
);

describe('bundled locales', () => {
  it.each(LOCALES.map((l) => [l.code, l] as const))('%s only translates names that exist', (_, locale) => {
    const unknown = Object.keys(locale.names).filter((name) => !englishNames.has(name));
    expect(unknown).toEqual([]);
    expect(Object.values(locale.names).every((n) => n.trim().length > 0)).toBe(true);
  });
});

describe('translated names', () => {
  const lynel = getEntry('totk', 'lynel')!;

  it('getName translates and falls back to English', () => {
    expect(getName(lynel)).toBe('lynel');
    expect(getName(lynel, zh)).toBe('莱尼尔');
    expect(getName(lynel, nl)).toBe('Lynel');
    const empty: Locale = { code: 'xx', official: false, names: {} };
    expect(getName(lynel, empty)).toBe('lynel');
  });

  it('getEntry accepts an exact translated name', () => {
    expect(getEntry('totk', '莱尼尔', { locale: zh })).toEqual(lynel);
    expect(getEntry('totk', '莱尼尔')).toBeUndefined();
    expect(getEntry('totk', 'Lynel', { locale: zh })).toEqual(lynel);
  });

  it('Dutch search works with Dutch-only words', () => {
    expect(search('totk', 'zwarte', { locale: nl }).map((e) => e.name)).toContain('black bokoblin');
    expect(getEntry('botw', 'Lopende Wachter', { locale: nl })?.name).toBe('guardian stalker');
  });

  it('search matches translated and English names', () => {
    expect(search('botw', '布林', { locale: zh }).map((e) => e.name)).toEqual(
      expect.arrayContaining(['bokoblin', 'moblin']),
    );
    expect(search('botw', 'lynel', { locale: zh }).length).toBeGreaterThan(1);
  });

  it('search ignores accents and full-width characters', () => {
    expect(search('totk', 'Lynél').map((e) => e.name)).toContain('lynel');
    expect(search('totk', 'ＬＹＮＥＬ').map((e) => e.name)).toContain('lynel');
    const custom: Locale = { code: 'xx', official: false, names: { lynel: 'Lýnël' } };
    expect(getEntry('totk', 'lynel', { locale: custom })).toBeDefined();
    expect(search('totk', 'lyne', { locale: custom }).map((e) => e.name)).toContain('lynel');
  });
});

describe('npcs', () => {
  it.each(GAMES)('%s has npcs with unique names and valid fields', (game) => {
    const npcs = getNpcs(game);
    expect(npcs.length).toBeGreaterThan(30);
    expect(new Set(npcs.map((n) => n.name)).size).toBe(npcs.length);
    expect(npcs.every((n) => n.games.includes(game) && n.name === n.name.toLowerCase())).toBe(true);
  });

  it('npc names never clash with compendium entry names', () => {
    const entries = new Set(GAMES.flatMap((g) => getEntries(g).map((e) => e.name)));
    const npcs = new Set(GAMES.flatMap((g) => getNpcs(g).map((n) => n.name)));
    expect([...npcs].filter((n) => entries.has(n))).toEqual([]);
  });

  it('filters by game and race', () => {
    expect(getNpcs('totk').map((n) => n.name)).toContain('rauru');
    expect(getNpcs('botw').map((n) => n.name)).not.toContain('rauru');
    expect(getNpcs('botw', 'zora').every((n) => n.race === 'zora')).toBe(true);
  });

  it('looks up and searches npcs, also in other languages', () => {
    expect(getNpc('totk', 'Impa')?.race).toBe('sheikah');
    expect(getNpc('totk', '英帕', { locale: zh })?.name).toBe('impa');
    expect(getName(getNpc('botw', 'princess zelda')!, nl)).toBe('Prinses Zelda');
    expect(searchNpcs('totk', 'zelda').map((n) => n.name)).toContain('princess zelda');
    expect(searchNpcs('botw', 'great fairy').length).toBe(4);
    expect(searchNpcs('totk', 'grante').map((n) => n.name)).toContain('granté');
  });
});
