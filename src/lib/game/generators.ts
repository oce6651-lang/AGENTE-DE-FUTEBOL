import type { Attributes, Club, Player, Position, Foot, TimelineEvent } from "./types";

// Deterministic-ish PRNG for future save-friendly rolls (still uses Math.random for events)
export function rid(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(6, "0")}`;
}

const NOMES = [
  "Lucas","Gabriel","Matheus","Pedro","João","Guilherme","Rafael","Thiago","Bruno","Vinícius",
  "Enzo","Miguel","Davi","Arthur","Bernardo","Heitor","Théo","Nicolas","Samuel","Yuri",
  "Kauã","Ryan","Eduardo","Felipe","Diego","Gustavo","Leonardo","André","Marcelo","Renato",
];
const SOBRENOMES = [
  "Silva","Oliveira","Santos","Souza","Pereira","Costa","Rodrigues","Almeida","Nascimento",
  "Lima","Araújo","Fernandes","Carvalho","Gomes","Martins","Rocha","Ribeiro","Alves","Monteiro",
  "Cardoso","Reis","Barbosa","Pinto","Moreira","Cavalcanti","Dias","Nunes","Marques","Correia",
];
const POSICOES: Position[] = ["GOL","ZAG","LD","LE","VOL","MC","MEI","PD","PE","SA","ATA"];
const PES: Foot[] = ["Destro","Destro","Destro","Canhoto","Ambidestro"];
const PERSONALIDADES = ["Ambicioso","Humilde","Ganancioso","Calmo","Explosivo"] as const;

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function gerarAtributos(base: number): Attributes {
  const jitter = () => Math.max(1, Math.min(100, base + rnd(-8, 8)));
  return {
    tecnica: jitter(),
    velocidade: jitter(),
    finalizacao: jitter(),
    passe: jitter(),
    fisico: jitter(),
    mental: jitter(),
  };
}

// Curva de potencial *muito* enviesada para baixo.
// A grande maioria dos jogadores é medíocre. Craques são raríssimos.
function rolarPotencial(): number {
  const r = Math.random();
  if (r < 0.55) return rnd(35, 55);           // 55% — jogador comum
  if (r < 0.85) return rnd(55, 68);           // 30% — jogador de divisões inferiores
  if (r < 0.965) return rnd(68, 78);          // 11.5% — bom jogador regional
  if (r < 0.995) return rnd(78, 87);          // 3% — talento nacional
  if (r < 0.9995) return rnd(87, 92);         // 0.45% — grande talento
  if (r < 0.99995) return rnd(92, 96);        // 0.045% — jogador de elite
  return rnd(96, 99);                          // ~0.005% — craque histórico
}

function rolarAltura(posicao: Position): number {
  // média por posição em cm
  const base = posicao === "GOL" ? 188 : posicao === "ZAG" ? 186 : posicao === "ATA" ? 180 : 175;
  return base + rnd(-8, 8);
}

export interface GerarPlayerOpts {
  cidade: string;
  local: string;
  nextId: number;
  ano: number;
  mes: number;
  semana: number;
}

export function gerarJogador({ cidade, local, nextId, ano, mes, semana }: GerarPlayerOpts): Player {
  const idade = rnd(12, 22);
  const posicao = pick(POSICOES);
  const potencial = rolarPotencial();
  // atual muito abaixo do potencial (jogador jovem cru)
  const gap = Math.max(15, 55 - idade * 2);
  const atual = Math.max(15, Math.min(potencial, rnd(potencial - gap - 5, potencial - gap + 5)));
  const nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`;
  const timeline: TimelineEvent[] = [
    { ano, mes, semana, tipo: "descoberta", texto: `Avistado em ${local} (${cidade}).` },
  ];
  return {
    id: rid("PLY", nextId),
    nome,
    idade,
    posicao,
    pe: pick(PES),
    altura: rolarAltura(posicao),
    cidade,
    clube: null,
    empresario: null,
    atributos: gerarAtributos(atual),
    atual,
    potencial,
    personalidade: pick(PERSONALIDADES),
    local,
    historico: [`Descoberto em ${local} (${cidade}).`],
    observado: 0,
    status: "Sem clube",
    timeline,
  };
}

const CLUBES_BASE: Array<Omit<Club, "id" | "interesse">> = [
  { nome: "Grêmio FBPA", categoria: "Serie A", orcamento: 250_000_000, cidade: "Porto Alegre" },
  { nome: "Internacional", categoria: "Serie A", orcamento: 240_000_000, cidade: "Porto Alegre" },
  { nome: "Juventude", categoria: "Serie A", orcamento: 60_000_000, cidade: "Caxias do Sul" },
  { nome: "Caxias", categoria: "Serie B", orcamento: 20_000_000, cidade: "Caxias do Sul" },
  { nome: "São Luiz", categoria: "Serie C", orcamento: 5_000_000, cidade: "Ijuí" },
  { nome: "Ypiranga", categoria: "Serie C", orcamento: 6_000_000, cidade: "Erechim" },
  { nome: "Brasil de Pelotas", categoria: "Serie B", orcamento: 12_000_000, cidade: "Pelotas" },
  { nome: "Novo Hamburgo", categoria: "Serie D", orcamento: 3_000_000, cidade: "Novo Hamburgo" },
  { nome: "Aimoré", categoria: "Amador", orcamento: 800_000, cidade: "São Leopoldo" },
  { nome: "Guarany de Bagé", categoria: "Amador", orcamento: 500_000, cidade: "Bagé" },
];

export function gerarClubes(): Club[] {
  return CLUBES_BASE.map((c, i) => ({
    id: rid("CLB", i + 1),
    ...c,
    interesse: [],
  }));
}

export { pick, rnd };