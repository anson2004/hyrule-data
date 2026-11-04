/**
 * Regenerates src/data/<game>.json from the Hyrule Compendium API.
 * Usage: npm run sync-data
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalize, type RawEntry } from '../src/normalize.js';
import { GAMES } from '../src/types.js';

const API = 'https://api.hyrule-compendium.com/api/v3';

for (const game of GAMES) {
  const res = await fetch(`${API}/compendium/all?game=${game}`);
  if (!res.ok) throw new Error(`${game}: HTTP ${res.status}`);
  const { data } = (await res.json()) as { data: RawEntry[] };

  const entries = data.map((raw) => normalize(raw, game)).sort((a, b) => a.id - b.id);
  const out = fileURLToPath(new URL(`../src/data/${game}.json`, import.meta.url));
  await writeFile(out, JSON.stringify(entries, null, 1) + '\n');
  console.log(`${game}: wrote ${entries.length} entries`);
}
