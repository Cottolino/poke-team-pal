const TYPE_COLORS: Record<string, string> = {
  normal: "var(--type-normal)",
  fire: "var(--type-fire)",
  water: "var(--type-water)",
  electric: "var(--type-electric)",
  grass: "var(--type-grass)",
  ice: "var(--type-ice)",
  fighting: "var(--type-fighting)",
  poison: "var(--type-poison)",
  ground: "var(--type-ground)",
  flying: "var(--type-flying)",
  psychic: "var(--type-psychic)",
  bug: "var(--type-bug)",
  rock: "var(--type-rock)",
  ghost: "var(--type-ghost)",
  dragon: "var(--type-dragon)",
  dark: "var(--type-dark)",
  steel: "var(--type-steel)",
  fairy: "var(--type-fairy)",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground"
      style={{ backgroundColor: TYPE_COLORS[type] ?? "var(--muted-foreground)" }}
    >
      {type}
    </span>
  );
}
