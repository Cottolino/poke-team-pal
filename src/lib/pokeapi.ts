const API = "https://pokeapi.co/api/v2";

export interface PokemonListEntry {
  name: string;
  url: string;
}

export interface PokemonDetails {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: string[];
}

export interface MoveDetails {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
}

let listCache: PokemonListEntry[] | null = null;

export async function fetchPokemonList(): Promise<PokemonListEntry[]> {
  if (listCache) return listCache;
  const res = await fetch(`${API}/pokemon?limit=1025`);
  if (!res.ok) throw new Error("Impossibile caricare la lista Pokémon");
  const data = await res.json();
  listCache = data.results as PokemonListEntry[];
  return listCache;
}

const detailsCache = new Map<string, PokemonDetails>();

export async function fetchPokemon(name: string): Promise<PokemonDetails> {
  const cached = detailsCache.get(name);
  if (cached) return cached;
  const res = await fetch(`${API}/pokemon/${name}`);
  if (!res.ok) throw new Error(`Pokémon non trovato: ${name}`);
  const d = await res.json();
  const details: PokemonDetails = {
    id: d.id,
    name: d.name,
    sprite:
      d.sprites.other?.["official-artwork"]?.front_default ??
      d.sprites.front_default ??
      "",
    types: d.types.map((t: { type: { name: string } }) => t.type.name),
    stats: d.stats.map(
      (s: { base_stat: number; stat: { name: string } }) => ({
        name: s.stat.name,
        value: s.base_stat,
      }),
    ),
    moves: d.moves.map((m: { move: { name: string } }) => m.move.name),
  };
  detailsCache.set(name, details);
  return details;
}

const moveCache = new Map<string, MoveDetails>();

export async function fetchMove(name: string): Promise<MoveDetails> {
  const cached = moveCache.get(name);
  if (cached) return cached;
  const res = await fetch(`${API}/move/${name}`);
  if (!res.ok) throw new Error(`Mossa non trovata: ${name}`);
  const d = await res.json();
  const move: MoveDetails = {
    name: d.name,
    type: d.type.name,
    power: d.power,
    accuracy: d.accuracy,
    pp: d.pp,
    damageClass: d.damage_class.name,
  };
  moveCache.set(name, move);
  return move;
}

export function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
