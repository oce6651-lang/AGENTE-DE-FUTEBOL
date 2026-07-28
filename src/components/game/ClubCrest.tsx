/** Escudo vetorial gerado a partir das cores e sigla do clube. */
export function ClubCrest({ cores, abrev, size = 40 }: {
  cores: [string, string];
  abrev: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" className="shrink-0 drop-shadow-md">
      <defs>
        <linearGradient id={`g-${abrev}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cores[0]} />
          <stop offset="100%" stopColor={cores[1]} />
        </linearGradient>
      </defs>
      <path d="M32 2 L60 12 V38 C60 55 46 66 32 70 C18 66 4 55 4 38 V12 Z"
        fill={`url(#g-${abrev})`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <path d="M32 8 L54 16 V38 C54 51 43 60 32 64 C21 60 10 51 10 38 V16 Z"
        fill="rgba(0,0,0,0.18)" />
      <text x="32" y="44" textAnchor="middle" fontSize="20" fontWeight="900"
        fill="#fff" fontFamily="system-ui, sans-serif">{abrev}</text>
    </svg>
  );
}
