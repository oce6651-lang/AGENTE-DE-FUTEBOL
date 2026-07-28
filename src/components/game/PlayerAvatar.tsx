const PELES = ["#f0c9a4", "#dda87c", "#b57a4b", "#8a5a34", "#5d3a20"];
const CABELOS = ["#1b1b1b", "#3b2314", "#6b4423", "#c9a227", "#2c2c2c"];
const CAMISAS = ["#1f8ecd", "#c8102e", "#1c8a4a", "#d9a441", "#7d3c98", "#2c3e50"];

/** Avatar vetorial determinístico gerado pela semente visual do atleta. */
export function PlayerAvatar({ seed, size = 48, ring }: { seed: number; size?: number; ring?: boolean }) {
  const pele = PELES[seed % PELES.length];
  const cabelo = CABELOS[Math.floor(seed / 5) % CABELOS.length];
  const camisa = CAMISAS[Math.floor(seed / 13) % CAMISAS.length];
  const barba = seed % 4 === 0;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64"
      className={"rounded-xl " + (ring ? "ring-2 ring-primary" : "ring-1 ring-border")}>
      <rect width="64" height="64" rx="14" fill="oklch(0.24 0.04 160)" />
      <path d="M8 64 C8 48 20 42 32 42 C44 42 56 48 56 64 Z" fill={camisa} />
      <circle cx="32" cy="28" r="14" fill={pele} />
      <path d="M18 26 C18 12 46 12 46 26 C42 20 36 18 32 18 C28 18 22 20 18 26 Z" fill={cabelo} />
      {barba && <path d="M20 30 C22 42 42 42 44 30 C40 38 24 38 20 30 Z" fill={cabelo} opacity="0.8" />}
      <circle cx="26" cy="29" r="2" fill="#1b1b1b" />
      <circle cx="38" cy="29" r="2" fill="#1b1b1b" />
    </svg>
  );
}
