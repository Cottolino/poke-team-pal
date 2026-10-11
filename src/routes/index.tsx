import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  fetchPokemon,
  fetchPokemonList,
  formatName,
  type PokemonDetails,
  type PokemonListEntry,
} from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge";
import { MovePicker } from "@/components/move-picker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pokémon Team Builder" },
      {
        name: "description",
        content: "Crea la tua squadra Pokémon da 6 e scegli le mosse con i dati della PokéAPI.",
      },
      { property: "og:title", content: "Pokémon Team Builder" },
      {
        property: "og:description",
        content: "Crea la tua squadra Pokémon da 6 e scegli le mosse con i dati della PokéAPI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamBuilder,
});

interface TeamMember {
  pokemon: PokemonDetails;
  moves: string[];
}

const STORAGE_KEY = "poke-team-v1";
const MAX_TEAM = 6;

function idFromUrl(url: string) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function TeamBuilder() {
  const [list, setList] = useState<PokemonListEntry[]>([]);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPokemonList()
      .then(setList)
      .catch((e) => setError(e.message));
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTeam(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
  }, [team]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? list.filter((p) => p.name.includes(q)) : list;
    return filtered.slice(0, 48);
  }, [list, query]);

  async function addPokemon(name: string) {
    if (team.length >= MAX_TEAM) return;
    setLoadingName(name);
    setError(null);
    try {
      const p = await fetchPokemon(name);
      setTeam((t) => (t.length >= MAX_TEAM ? t : [...t, { pokemon: p, moves: [] }]));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingName(null);
    }
  }

  function removeMember(i: number) {
    setTeam((t) => t.filter((_, idx) => idx !== i));
  }

  function toggleMove(i: number, move: string) {
    setTeam((t) =>
      t.map((m, idx) => {
        if (idx !== i) return m;
        if (m.moves.includes(move)) return { ...m, moves: m.moves.filter((x) => x !== move) };
        if (m.moves.length >= 4) return m;
        return { ...m, moves: [...m.moves, move] };
      }),
    );
  }

  const editingMember = editing !== null ? team[editing] : null;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-4 border-foreground bg-card">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-primary" />
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-foreground" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground bg-card" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Team Builder</h1>
          </div>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-bold">
            {team.length}/{MAX_TEAM}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px]">
        {/* Team */}
        <section className="lg:order-2">
          <h2 className="mb-3 text-lg font-bold">La tua squadra</h2>
          <div className="grid gap-3">
            {Array.from({ length: MAX_TEAM }).map((_, i) => {
              const m = team[i];
              if (!m)
                return (
                  <div
                    key={i}
                    className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground"
                  >
                    Slot {i + 1} libero
                  </div>
                );
              return (
                <div key={i} className="rounded-xl border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.pokemon.sprite}
                      alt={m.pokemon.name}
                      className="h-16 w-16 rounded-lg bg-muted object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-bold">{formatName(m.pokemon.name)}</p>
                        <button
                          onClick={() => removeMember(i)}
                          className="text-xs font-semibold text-muted-foreground hover:text-destructive"
                        >
                          Rimuovi
                        </button>
                      </div>
                      <div className="mt-1 flex gap-1">
                        {m.pokemon.types.map((t) => (
                          <TypeBadge key={t} type={t} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <button
                        key={j}
                        onClick={() => setEditing(i)}
                        className={`truncate rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                          m.moves[j]
                            ? "bg-secondary text-secondary-foreground hover:bg-accent"
                            : "border border-dashed text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m.moves[j] ? formatName(m.moves[j]) : "+ Mossa"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {team.length > 0 && (
            <button
              onClick={() => setTeam([])}
              className="mt-3 w-full rounded-lg py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Svuota squadra
            </button>
          )}
        </section>

        {/* Search */}
        <section className="lg:order-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca un Pokémon (es. pikachu)..."
            className="w-full rounded-xl border bg-card px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          {team.length >= MAX_TEAM && (
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Squadra completa! Rimuovi un Pokémon per aggiungerne un altro.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {results.map((p) => {
              const id = idFromUrl(p.url);
              return (
                <button
                  key={p.name}
                  disabled={team.length >= MAX_TEAM || loadingName !== null}
                  onClick={() => addPokemon(p.name)}
                  className="group flex flex-col items-center rounded-xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <img
                    loading="lazy"
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                    alt={p.name}
                    className="h-20 w-20 object-contain"
                  />
                  <span className="text-xs text-muted-foreground">#{id}</span>
                  <span className="text-sm font-bold">
                    {loadingName === p.name ? "Aggiungo…" : formatName(p.name)}
                  </span>
                </button>
              );
            })}
          </div>
          {list.length === 0 && !error && (
            <p className="mt-6 text-center text-sm text-muted-foreground">Caricamento Pokémon…</p>
          )}
        </section>
      </main>

      {editingMember && editing !== null && (
        <MovePicker
          pokemonName={editingMember.pokemon.name}
          availableMoves={editingMember.pokemon.moves}
          selected={editingMember.moves}
          onToggle={(mv) => toggleMove(editing, mv)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
