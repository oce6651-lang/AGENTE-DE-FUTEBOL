import type {
  Attributes, Club, ClubPersonality, Division, Player, Position, Foot,
  TimelineEvent, AgeCategory, RivalAgent,
} from "./types";

export function rid(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(6, "0")}`;
}

const NOMES = [
  "Lucas","Gabriel","Matheus","Pedro","João","Guilherme","Rafael","Thiago","Bruno","Vinícius",
  "Enzo","Miguel","Davi","Arthur","Bernardo","Heitor","Théo","Nicolas","Samuel","Yuri",
  "Kauã","Ryan","Eduardo","Felipe","Diego","Gustavo","Leonardo","André","Marcelo","Renato",
  "Wesley","Jonas","Caio","Igor","Otávio","Murilo","Danilo","Everton","Alan","Rodrigo",
];
const SOBRENOMES = [
  "Silva","Oliveira","Santos","Souza","Pereira","Costa","Rodrigues","Almeida","Nascimento",
  "Lima","Araújo","Fernandes","Carvalho","Gomes","Martins","Rocha","Ribeiro","Alves","Monteiro",
  "Cardoso","Reis","Barbosa","Pinto","Moreira","Cavalcanti","Dias","Nunes","Marques","Correia",
];
const POSICOES: Position[] = ["GOL","ZAG","LD","LE","VOL","MC","MEI","PD","PE","SA","ATA"];
const PES: Foot[] = ["Destro","Destro","Destro","Canhoto","Ambidestro"];
const PERSONALIDADES = ["Ambicioso","Humilde","Ganancioso","Calmo","Explosivo"] as const;

export const TECNICOS = [
  "Valdir Machado","Osmar Prates","Ney Bittencourt","Cláudio Farias","Ademir Rocha",
  "Jair Tavares","Zeca Ferrugem","Paulo Roberto Lima","Nando Camargo","Ivo Dellabrida",
  "Sérgio Bandeira","Toninho Mota","Wanderley Pires","Beto Andrade",
];
export const ARBITROS = [
  "Anderson Klaus","Rafael Trombeta","Márcio Bueno","Juliano Peres","Ricardo Gaúcho",
  "Fabrício Neves","Éder Salvi","Wagner Reis",
];

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function gerarAtributos(base: number, posicao: Position): Attributes {
  const jitter = (bonus = 0) => Math.max(1, Math.min(100, base + bonus + rnd(-8, 8)));
  const atk = posicao === "ATA" || posicao === "SA" || posicao === "PD" || posicao === "PE";
  const meio = posicao === "MEI" || posicao === "MC" || posicao === "VOL";
  const def = posicao === "ZAG" || posicao === "LD" || posicao === "LE" || posicao === "GOL";
  return {
    tecnica: jitter(meio ? 4 : 0),
    velocidade: jitter(atk ? 5 : def ? -2 : 0),
    finalizacao: jitter(atk ? 8 : def ? -12 : 0),
    passe: jitter(meio ? 7 : 0),
    fisico: jitter(def ? 5 : 0),
    mental: jitter(0),
  };
}

/** Curva de potencial extremamente enviesada para baixo. Craques são raríssimos. */
function rolarPotencial(): number {
  const r = Math.random();
  if (r < 0.62) return rnd(30, 52);
  if (r < 0.88) return rnd(52, 64);
  if (r < 0.972) return rnd(64, 74);
  if (r < 0.9955) return rnd(74, 84);
  if (r < 0.99935) return rnd(84, 90);
  if (r < 0.99993) return rnd(90, 95);
  return rnd(95, 99);
}

function rolarAltura(posicao: Position, idade: number): number {
  const base = posicao === "GOL" ? 188 : posicao === "ZAG" ? 186 : posicao === "ATA" ? 180 : 175;
  const crescimento = idade >= 18 ? 0 : -(18 - idade) * 3;
  return base + crescimento + rnd(-7, 7);
}

export function faixaIdade(cat: AgeCategory): [number, number] {
  switch (cat) {
    case "Sub-13": return [11, 13];
    case "Sub-15": return [13, 15];
    case "Sub-17": return [15, 17];
    case "Livre": return [18, 30];
    case "Veterano": return [31, 41];
  }
}

export interface GerarPlayerOpts {
  cidade: string;
  local: string;
  nextId: number;
  ano: number;
  mes: number;
  semana: number;
  categoria?: AgeCategory;
  posicao?: Position;
}

export function gerarJogador({ cidade, local, nextId, ano, mes, semana, categoria, posicao }: GerarPlayerOpts): Player {
  const [minI, maxI] = categoria ? faixaIdade(categoria) : [12, 22];
  const idade = rnd(minI, maxI);
  const pos = posicao ?? pick(POSICOES);
  const potencial = rolarPotencial();
  // Quanto mais jovem, maior a distância entre o nível atual e o potencial.
  const gap = Math.max(6, 52 - idade * 2);
  const atual = Math.max(12, Math.min(potencial, rnd(potencial - gap - 5, potencial - gap + 5)));
  const nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`;
  const timeline: TimelineEvent[] = [
    { ano, mes, semana, tipo: "descoberta", texto: `Avistado em ${local} (${cidade}).` },
  ];
  return {
    id: rid("PLY", nextId),
    nome,
    idade,
    posicao: pos,
    pe: pick(PES),
    altura: rolarAltura(pos, idade),
    cidade,
    clube: null,
    empresario: null,
    atributos: gerarAtributos(atual, pos),
    atual,
    potencial,
    personalidade: pick(PERSONALIDADES),
    local,
    historico: [`Descoberto em ${local} (${cidade}).`],
    observado: 0,
    confianca: rnd(2, 12),
    status: "Sem clube",
    timeline,
    relatorios: [],
    visual: rnd(0, 9999),
  };
}

interface ClubSeed {
  nome: string; abrev: string; categoria: Division; personalidade: ClubPersonality;
  orcamento: number; cidade: string; cores: [string, string];
}

const CLUBES_BASE: ClubSeed[] = [
  { nome: "Grêmio FBPA", abrev: "GRE", categoria: "Serie A", personalidade: "Formador", orcamento: 250_000_000, cidade: "Porto Alegre", cores: ["#1f8ecd", "#0b1d2e"] },
  { nome: "Internacional", abrev: "INT", categoria: "Serie A", personalidade: "Imediatista", orcamento: 240_000_000, cidade: "Porto Alegre", cores: ["#c8102e", "#2a0a10"] },
  { nome: "Juventude", abrev: "JUV", categoria: "Serie A", personalidade: "Pechincha", orcamento: 60_000_000, cidade: "Caxias do Sul", cores: ["#1c8a4a", "#0e2b1b"] },
  { nome: "Caxias", abrev: "CAX", categoria: "Serie B", personalidade: "Vitrine", orcamento: 20_000_000, cidade: "Caxias do Sul", cores: ["#d9a441", "#20160a"] },
  { nome: "Brasil de Pelotas", abrev: "BRA", categoria: "Serie B", personalidade: "Tradicional", orcamento: 12_000_000, cidade: "Pelotas", cores: ["#c62828", "#1b1b1b"] },
  { nome: "São Luiz", abrev: "SLZ", categoria: "Serie C", personalidade: "Formador", orcamento: 5_000_000, cidade: "Ijuí", cores: ["#2b6cb0", "#101a26"] },
  { nome: "Ypiranga", abrev: "YPI", categoria: "Serie C", personalidade: "Vitrine", orcamento: 6_000_000, cidade: "Erechim", cores: ["#1a7f5a", "#0d221a"] },
  { nome: "Novo Hamburgo", abrev: "NHA", categoria: "Serie D", personalidade: "Pechincha", orcamento: 3_000_000, cidade: "Novo Hamburgo", cores: ["#c0392b", "#1a0f0e"] },
  { nome: "Aimoré", abrev: "AIM", categoria: "Amador", personalidade: "Formador", orcamento: 800_000, cidade: "São Leopoldo", cores: ["#2f855a", "#11251a"] },
  { nome: "Guarany de Bagé", abrev: "GUA", categoria: "Amador", personalidade: "Pechincha", orcamento: 500_000, cidade: "Bagé", cores: ["#2d6a9f", "#0c1a26"] },
];

export function gerarClubes(): Club[] {
  return CLUBES_BASE.map((c, i) => ({
    id: rid("CLB", i + 1),
    ...c,
    tecnico: pick(TECNICOS),
    moralTecnico: rnd(45, 80),
    pontos: 0,
    jogos: 0,
    elenco: rnd(22, 30),
    necessidades: [pick(POSICOES), pick(POSICOES)],
    interesse: [],
    confiancaEmVoce: rnd(0, 8),
  }));
}

const AGENCIAS_RIVAIS = [
  "Prime Sports","Elite Foot","Nova Geração","Base Talentos","Grupo Vanguarda","Sul Scout",
];

export function gerarRivais(): RivalAgent[] {
  return AGENCIAS_RIVAIS.map((a, i) => ({
    id: rid("RIV", i + 1),
    nome: `${pick(NOMES)} ${pick(SOBRENOMES)}`,
    agencia: a,
    reputacao: rnd(25, 85),
    clientes: rnd(4, 40),
  }));
}

export { pick, rnd, POSICOES };
