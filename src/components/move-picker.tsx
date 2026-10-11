import { useEffect, useMemo, useState } from "react";
import { fetchMove, formatName, type MoveDetails } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge";

interface MovePickerProps {
  pokemonName: string;
  availableMoves: string[];
  selected: string[];
  onToggle: (move: string) => void;
  onClose: () => void;
}

export function MovePicker({
  pokemonName,
  availableMoves,
  selected,
  onToggle,
  onClose,
}: MovePickerProps) {
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState<Record<string, MoveDetails | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? availableMoves.filter((m) => m.includes(q))
      : availableMoves;
    return list.slice(0, 60);
  }, [availableMoves, query]);

  useEffect(() => {
    let cancelled = false;
    const missing = filtered.filter((m) => !(m in details)).slice(0, 20);
    if (missing.length === 0) return;
    Promise.all(
      missing.map(async (m) => {
        try {
          return [m, await fetchMove(m)] as const;
        } catch {
          return [m, null] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setDetails((prev) => {
        const next = { ...prev };
        for (const [k, v] of entries) next[k] = v;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [filtered, details]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Mosse di {formatName(pokemonName)}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Chiudi
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Seleziona fino a 4 mosse ({selected.length}/4)
          </p>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca una mossa..."
            className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((m) => {
            const d = details[m];
            const isSelected = selected.includes(m);
            return (
              <button
                key={m}
                onClick={() => onToggle(m)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSelected ? "bg-accent" : "hover:bg-muted"
                }`}
              >
                <span className="font-semibold">{formatName(m)}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {d ? (
                    <>
                      <TypeBadge type={d.type} />
                      <span>{d.power ? `Pot. ${d.power}` : "—"}</span>
                      <span>{d.pp ? `PP ${d.pp}` : ""}</span>
                    </>
                  ) : (
                    <span className="animate-pulse">…</span>
                  )}
                  {isSelected && <span className="font-bold">✓</span>}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nessuna mossa trovata
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
