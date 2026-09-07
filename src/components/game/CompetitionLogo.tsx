import type { CompetitionType } from "@/lib/game/data/leagues";
import type { Modalidade } from "@/lib/game/types";

/** Paleta base por tipo de competição — dá identidade visual a cada troféu. */
const PALETAS: Record<CompetitionType, [string, string]> = {
  nacional: ["#1e3a8a", "#0ea5e9"],
  copa: ["#7c2d12", "#f59e0b"],
  continental: ["#065f46", "#22c55e"],
  estadual: ["#4c1d95", "#a855f7"],
  base: ["#0f172a", "#38bdf8"],
  amadora: ["#374151", "#9ca3af"],
  regional: ["#7f1d1d", "#ef4444"],
};

const FORMAS = [
  // brasão arredondado
  "M32 2 C50 2 62 14 62 33 C62 54 48 68 32 70 C16 68 2 54 2 33 C2 14 14 2 32 2 Z",
  // escudo clássico
  "M32 2 L60 12 V38 C60 55 46 66 32 70 C18 66 4 55 4 38 V12 Z",
  // losango
  "M32 1 L63 36 L32 71 L1 36 Z",
  // hexágono
  "M32 2 L58 14 V46 L32 70 L6 46 V14 Z",
];

function hash(txt: string) {
  let h = 11;
  for (let i = 0; i < txt.length; i++) h = (h * 33 + txt.charCodeAt(i)) % 100000;
  return h;
}

/** Sigla curta e legível a partir do nome da competição. */
export function siglaCompeticao(nome: string): string {
  const stop = new Set(["de", "do", "da", "dos", "das", "del", "of", "the", "e", "la", "el"]);
  const palavras = nome.split(/[\s-]+/).filter(p => p && !stop.has(p.toLowerCase()));
  const letras = palavras.map(p => (/^\d/.test(p) ? p[0] : p[0].toUpperCase())).join("");
  return (letras || nome).slice(0, 3);
}

/**
 * Logo vetorial genérico de uma liga ou copa, gerado a partir do nome e do tipo.
 * Copas ganham um troféu, ligas uma bola/quadra e continentais um globo estilizado.
 */
export function CompetitionLogo({ nome, tipo, modalidade = "campo", size = 40 }: {
  nome: string;
  tipo: CompetitionType;
  modalidade?: Modalidade;
  size?: number;
}) {
  const h = hash(nome);
  const forma = FORMAS[h % FORMAS.length];
  const [c1, c2] = PALETAS[tipo] ?? PALETAS.nacional;
  const uid = `${h}-${tipo}`;
  const sigla = siglaCompeticao(nome);
  const isCopa = tipo === "copa" || tipo === "continental";

  return (
    <svg width={size} height={size * 1.125} viewBox="0 0 64 72"
      className="shrink-0 drop-shadow-md" aria-hidden>
      <defs>
        <linearGradient id={`cl-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <clipPath id={`clc-${uid}`}><path d={forma} /></clipPath>
      </defs>
      <path d={forma} fill={`url(#cl-${uid})`} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <g clipPath={`url(#clc-${uid})`}>
        <path d="M-10 58 L52 -12 L68 2 L6 72 Z" fill="rgba(255,255,255,0.10)" />
        {isCopa ? (
          // troféu
          <g fill="rgba(255,255,255,0.85)">
            <path d="M24 16 H40 V26 C40 33 36 37 32 37 C28 37 24 33 24 26 Z" />
            <path d="M20 17 H24 V25 C21 25 20 22 20 19 Z M44 17 H40 V25 C43 25 44 22 44 19 Z" />
            <rect x="30" y="37" width="4" height="6" />
            <rect x="24" y="43" width="16" height="4" rx="1" />
          </g>
        ) : modalidade === "futsal" ? (
          // quadra
          <g stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none">
            <rect x="16" y="16" width="32" height="24" rx="2" />
            <line x1="32" y1="16" x2="32" y2="40" />
            <circle cx="32" cy="28" r="5" />
          </g>
        ) : (
          // bola
          <g>
            <circle cx="32" cy="27" r="11" fill="rgba(255,255,255,0.85)" />
            <path d="M32 20 L37 24 L35 30 H29 L27 24 Z" fill={c1} />
          </g>
        )}
      </g>
      <text x="32" y="60" textAnchor="middle" fontSize="15" fontWeight="900"
        fill="#fff" fontFamily="system-ui, sans-serif">{sigla}</text>
    </svg>
  );
}
