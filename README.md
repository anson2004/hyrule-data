# hyrule-data

[![npm](https://img.shields.io/npm/v/hyrule-data)](https://www.npmjs.com/package/hyrule-data)

Offline, fully typed data for *Breath of the Wild* (`botw`) and *Tears of the Kingdom* (`totk`):
monsters, creatures, materials, equipment and treasure. It needs no network access and has zero runtime dependencies.

> Unofficial fan project, not affiliated with Nintendo. See [NOTICE.md](NOTICE.md).

```sh
npm install hyrule-data
```

## Usage

```ts
import { getEntry, getMonsters, findByDrop, search, getEntries } from 'hyrule-data';

getEntry('totk', 'lynel');
// { id: 147, name: 'lynel', game: 'totk', category: 'monsters',
//   commonLocations: ['Hyrule Field', 'Central Hyrule Depths'],
//   drops: ['lynel saber horn', 'lynel mace horn', 'lynel hoof', 'arrow x10'], dlc: false }

getMonsters('botw');                    // Monster[]
getEntries('totk', 'materials');        // Material[] (typed by category)
findByDrop('botw', 'lynel horn');       // every entry that drops it
search('totk', 'octorok');              // name contains "octorok"
```

### API

All functions take a `game` of `'botw' | 'totk'` and work offline.

| Function | Returns |
| --- | --- |
| `getEntries(game, category?)` | All entries, or entries in one category |
| `getEntry(game, idOrName)` | One entry by compendium number or name (case-insensitive), or `undefined` |
| `getMonsters` / `getCreatures` / `getMaterials` / `getEquipment` / `getTreasure` `(game)` | Entries in that category |
| `search(game, query)` | Entries whose name contains `query` |
| `findByDrop(game, item)` | Entries that drop `item` |
| `findByLocation(game, region)` | Entries commonly found in `region` |
| `getLocations(game)` | All region names in the data |
| `getNpcs(game, race?)` / `getNpc(game, name)` / `searchNpcs(game, query)` | Major named characters (name, games, race) |

### Translated names

Simplified Chinese (`hyrule-data/locales/zh`) and Dutch (`hyrule-data/locales/nl`) are supported.

```ts
search('totk', '莱尼尔', { locale: zh }); // import { zh } from 'hyrule-data/locales/zh'
```

The package does not include in-game description text or images. See [NOTICE.md](NOTICE.md).

## Data model

```ts
type Entry = Creature | Equipment | Material | Monster | Treasure; // discriminated by `category`
```

Compendium `id`s are unique within a game but not across games.

## Development

```sh
npm install
npm test
npm run sync-data   # refresh src/data/*.json from the API
npm run build
```

## License

MIT. Data is derived from the Hyrule Compendium API (MIT). See [NOTICE.md](NOTICE.md).
