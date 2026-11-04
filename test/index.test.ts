import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  GAMES,
  findByDrop,
  findByLocation,
  getEntries,
  getEntry,
  getEquipment,
  getLocations,
  getMaterials,
  getMonsters,
  search,
} from '../src/index.js';

describe('bundled data', () => {
  it.each(GAMES)('%s has entries in every category, unique ids and names', (game) => {
    const all = getEntries(game);
    expect(all.length).toBeGreaterThan(300);
    for (const c of CATEGORIES) expect(getEntries(game, c).length).toBeGreaterThan(0);
    expect(new Set(all.map((e) => e.id)).size).toBe(all.length);
    expect(new Set(all.map((e) => e.name)).size).toBe(all.length);
    expect(all.every((e) => e.game === game)).toBe(true);
  });

  it('does not bundle descriptions or images', () => {
    for (const game of GAMES) {
      for (const e of getEntries(game)) {
        expect(e).not.toHaveProperty('description');
        expect(e).not.toHaveProperty('image');
        expect(e).not.toHaveProperty('imageUrl');
      }
    }
  });
});

describe('lookups', () => {
  it('getEntry by id and by name (case / underscore insensitive)', () => {
    const byId = getEntry('totk', 101);
    expect(byId?.name).toBe('water octorok');
    expect(getEntry('totk', 'Water_Octorok')).toEqual(byId);
    expect(getEntry('totk', 'nope')).toBeUndefined();
  });

  it('category helpers return the right shape', () => {
    expect(getMonsters('botw').every((m) => Array.isArray(m.drops))).toBe(true);
    expect(getMaterials('totk').some((m) => typeof m.fuseAttackPower === 'number')).toBe(true);
    const branch = getEquipment('totk').find((e) => e.name === 'tree branch');
    expect(branch).toMatchObject({ attack: 2, type: 'one-handed weapon' });
  });

  it('search, findByDrop, findByLocation', () => {
    expect(search('botw', 'LYNEL').length).toBeGreaterThan(1);
    expect(search('botw', '   ')).toEqual([]);
    expect(findByDrop('totk', 'Octorok Tentacle').map((e) => e.name)).toContain('water octorok');
    const region = getLocations('totk')[0]!;
    expect(findByLocation('totk', region.toUpperCase()).length).toBeGreaterThan(0);
  });

  it('rejects unknown games', () => {
    // @ts-expect-error invalid game on purpose
    expect(() => getEntries('ootk')).toThrow(/Unknown game/);
  });
});
