/** Formatos genéricos de escudo — cada clube recebe um deles de forma estável. */
const CONTORNOS = [
  // escudo clássico
  "M32 2 L60 12 V38 C60 55 46 66 32 70 C18 66 4 55 4 38 V12 Z",
  // escudo redondo
  "M32 2 C50 2 62 15 62 34 C62 54 48 68 32 70 C16 68 2 54 2 34 C2 15 14 2 32 2 Z",
  // escudo em bandeira/ponta
  "M6 4 H58 V44 L32 70 L6 44 Z",
  // escudo hexagonal
  "M32 2 L58 14 V46 L32 70 L6 46 V14 Z",
];

const INTERNOS = [
  "M32 8 L54 16 V38 C54 51 43 60 32 64 C21 60 10 51 10 38 V16 Z",
  "M32 8 C46 8 56 18 56 34 C56 50 45 62 32 64 C19 62 8 50 8 34 C8 18 18 8 32 8 Z",
  "M12 10 H52 V42 L32 62 L12 42 Z",
  "M32 8 L52 17 V44 L32 64 L12 44 V17 Z",
];

function hash(txt: string) {
  let h = 7;
  for (let i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) % 100000;
  return h;
}

/** Escudo vetorial genérico, gerado a partir das cores e da sigla do clube. */
export function ClubCrest({ cores, abrev, size = 40 }: {
  cores: [string, string];
  abrev: string;
  size?: number;
}) {
  const h = hash(abrev);
  const forma = h % CONTORNOS.length;
  const ornamento = Math.floor(h / 7) % 3; // 0 = faixa, 1 = banda, 2 = estrelas
  const uid = `${abrev}-${h}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" className="shrink-0 drop-shadow-md" aria-hidden>
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cores[0]} />
          <stop offset="100%" stopColor={cores[1]} />
        </linearGradient>
        <clipPath id={`c-${uid}`}><path d={CONTORNOS[forma]} /></clipPath>
      </defs>
      <path d={CONTORNOS[forma]} fill={`url(#g-${uid})`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <g clipPath={`url(#c-${uid})`}>
        {ornamento === 0 && <rect x="0" y="26" width="64" height="10" fill="rgba(255,255,255,0.16)" />}
        {ornamento === 1 && <path d="M-10 60 L54 -10 L70 4 L6 74 Z" fill="rgba(255,255,255,0.14)" />}
        {ornamento === 2 && <circle cx="32" cy="30" r="26" fill="rgba(0,0,0,0.16)" />}
      </g>
      <path d={INTERNOS[forma]} fill="rgba(0,0,0,0.18)" />
      <text x="32" y="42" textAnchor="middle" fontSize="19" fontWeight="900"
        fill="#fff" fontFamily="system-ui, sans-serif">{abrev.slice(0, 3)}</text>
    </svg>
  );
}
