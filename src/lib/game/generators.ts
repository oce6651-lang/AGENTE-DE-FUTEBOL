import type { Attributes, Club, Player, Position, Foot } from "./types";

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

export interface GerarPlayerOpts {
  cidade: string;
  local: string;
  nextId: number;
}

export function gerarJogador({ cidade, local, nextId }: GerarPlayerOpts): Player {
  const idade = rnd(12, 22);
  const potencial = rnd(40, 95);
  const atual = Math.max(20, Math.min(potencial, rnd(potencial - 35, potencial - 5)));
  return {
    id: rid("PLY", nextId),
    nome: `${pick(NOMES)} ${pick(SOBRENOMES)}`,
    idade,
    posicao: pick(POSICOES),
    pe: pick(PES),
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