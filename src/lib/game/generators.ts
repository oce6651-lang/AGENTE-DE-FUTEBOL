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
function sortearPotencial(): number {
  const r = Math.random();
  if (r < 0.62) return rnd(30, 52);
  if (r < 0.88) return rnd(52, 64);
  if (r < 0.972) return rnd(64, 74);
  if (r < 0.9955) return rnd(74, 84);
  if (r < 0.99935) return rnd(84, 90);
  if (r < 0.99993) return rnd(90, 95);
  return rnd(95, 99);
}

/**
 * Palcos melhores concentram talento: sorteia várias vezes e fica com o melhor
 * resultado, mas nunca garante um craque.
 */
function rolarPotencial(nivel: number): number {
  const tentativas = 1 + Math.floor(Math.max(0, nivel - 1) / 2);
  let melhor = 0;
  for (let i = 0; i < tentativas; i++) melhor = Math.max(melhor, sortearPotencial());
  return melhor;
}

function rolarAltura(posicao: Position, idade: number): number {
  const base = posicao === "GOL" ? 188 : posicao === "ZAG" ? 186 : posicao === "ATA" ? 180 : 175;
  const crescimento = idade >= 18 ? 0 : -(18 - idade) * 3;
  return base + crescimento + rnd(-7, 7);
}

export function faixaIdade(cat: AgeCategory): [number, number] {
  switch (cat) {
    case "Sub-11": return [9, 11];
    case "Sub-13": return [11, 13];
    case "Sub-15": return [13, 15];
    case "Sub-17": return [15, 17];
    case "Sub-18": return [16, 18];
    case "Sub-20": return [18, 20];
    case "Livre": return [18, 32];
    case "Veterano": return [33, 41];
    default: return [12, 22];
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
  /** Nível do palco (1 a 10). Eleva a média de talento em campo. */
  nivel?: number;
}

export function gerarJogador({ cidade, local, nextId, ano, mes, semana, categoria, posicao, nivel = 1 }: GerarPlayerOpts): Player {
  const [minI, maxI] = categoria ? faixaIdade(categoria) : [12, 22];
  const idade = rnd(minI, maxI);
  const pos = posicao ?? pick(POSICOES);
  const potencial = rolarPotencial(nivel);
  // Quanto mais jovem, maior a distância entre o nível atual e o potencial.
  // Palcos de elite já entregam atletas mais desenvolvidos para a idade.
  const gap = Math.max(4, 52 - idade * 2 - nivel);
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
  nome: string; abrev: string; categoria: Division; liga: string; personalidade: ClubPersonality;
  orcamento: number; cidade: string; cores: [string, string];
}

/** Competições disputadas no mundo do jogo. */
export const LIGAS: Record<Division, string> = {
  Amador: "Copa Regional Amadora",
  "Serie D": "Brasileirão Série D",
  "Serie C": "Brasileirão Série C",
  "Serie B": "Brasileirão Série B",
  "Serie A": "Brasileirão Série A",
  Elite: "Elite Europeia",
};

const CLUBES_BASE: ClubSeed[] = [
  // ---------- Elite (mercado internacional) ----------
  { nome: "Vitória de Lisboa", abrev: "VLX", categoria: "Elite", liga: "Primeira Liga (POR)", personalidade: "Vitrine", orcamento: 900_000_000, cidade: "Lisboa", cores: ["#1f6f4a", "#0a1a12"] },
  { nome: "Ajaccio United", abrev: "AJU", categoria: "Elite", liga: "Eredivisie (NED)", personalidade: "Formador", orcamento: 820_000_000, cidade: "Amsterdã", cores: ["#c0392b", "#141414"] },
  { nome: "Real Castilla", abrev: "RCA", categoria: "Elite", liga: "La Liga (ESP)", personalidade: "Imediatista", orcamento: 1_400_000_000, cidade: "Madri", cores: ["#e8e8e8", "#1b1b1b"] },
  { nome: "Milano Nord", abrev: "MNO", categoria: "Elite", liga: "Serie A (ITA)", personalidade: "Tradicional", orcamento: 1_100_000_000, cidade: "Milão", cores: ["#1d3f8f", "#0a1128"] },

  // ---------- Série A ----------
  { nome: "Grêmio FBPA", abrev: "GRE", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Formador", orcamento: 250_000_000, cidade: "Porto Alegre", cores: ["#1f8ecd", "#0b1d2e"] },
  { nome: "Internacional", abrev: "INT", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Imediatista", orcamento: 240_000_000, cidade: "Porto Alegre", cores: ["#c8102e", "#2a0a10"] },
  { nome: "Juventude", abrev: "JUV", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Pechincha", orcamento: 60_000_000, cidade: "Caxias do Sul", cores: ["#1c8a4a", "#0e2b1b"] },
  { nome: "Athletico Paranaense", abrev: "CAP", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Vitrine", orcamento: 210_000_000, cidade: "Curitiba", cores: ["#c0392b", "#161616"] },
  { nome: "Palmeiras", abrev: "PAL", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Formador", orcamento: 430_000_000, cidade: "São Paulo", cores: ["#0f6b3d", "#08210f"] },
  { nome: "São Paulo FC", abrev: "SPF", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Tradicional", orcamento: 300_000_000, cidade: "São Paulo", cores: ["#b71c1c", "#101010"] },
  { nome: "Santos FC", abrev: "SAN", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Vitrine", orcamento: 180_000_000, cidade: "Santos", cores: ["#e6e6e6", "#151515"] },
  { nome: "Flamengo", abrev: "FLA", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Imediatista", orcamento: 520_000_000, cidade: "Rio de Janeiro", cores: ["#c62828", "#1a1a1a"] },
  { nome: "Fluminense", abrev: "FLU", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Formador", orcamento: 190_000_000, cidade: "Rio de Janeiro", cores: ["#7b1e3a", "#0f2419"] },
  { nome: "Atlético Mineiro", abrev: "CAM", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Imediatista", orcamento: 320_000_000, cidade: "Belo Horizonte", cores: ["#1c1c1c", "#3a3a3a"] },
  { nome: "Cruzeiro", abrev: "CRU", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Formador", orcamento: 230_000_000, cidade: "Belo Horizonte", cores: ["#1e3f9c", "#0a132b"] },
  { nome: "Bahia", abrev: "BAH", categoria: "Serie A", liga: "Brasileirão Série A", personalidade: "Vitrine", orcamento: 200_000_000, cidade: "Salvador", cores: ["#1565c0", "#0b1c2e"] },

  // ---------- Série B ----------
  { nome: "Caxias", abrev: "CAX", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Vitrine", orcamento: 20_000_000, cidade: "Caxias do Sul", cores: ["#d9a441", "#20160a"] },
  { nome: "Coritiba", abrev: "CFC", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Formador", orcamento: 45_000_000, cidade: "Curitiba", cores: ["#0f6b3d", "#e0e0e0"] },
  { nome: "Guarani", abrev: "GUR", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Pechincha", orcamento: 18_000_000, cidade: "Campinas", cores: ["#1b7a45", "#0d2419"] },
  { nome: "Ponte Preta", abrev: "PON", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Formador", orcamento: 22_000_000, cidade: "Campinas", cores: ["#2b2b2b", "#c9c9c9"] },
  { nome: "Avaí", abrev: "AVA", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Tradicional", orcamento: 26_000_000, cidade: "Florianópolis", cores: ["#1f5fb0", "#0b1a2e"] },
  { nome: "Brasil de Pelotas", abrev: "BRA", categoria: "Serie B", liga: "Brasileirão Série B", personalidade: "Tradicional", orcamento: 12_000_000, cidade: "Pelotas", cores: ["#c62828", "#1b1b1b"] },

  // ---------- Série C ----------
  { nome: "São Luiz", abrev: "SLZ", categoria: "Serie C", liga: "Brasileirão Série C", personalidade: "Formador", orcamento: 5_000_000, cidade: "Ijuí", cores: ["#2b6cb0", "#101a26"] },
  { nome: "Ypiranga", abrev: "YPI", categoria: "Serie C", liga: "Brasileirão Série C", personalidade: "Vitrine", orcamento: 6_000_000, cidade: "Erechim", cores: ["#1a7f5a", "#0d221a"] },
  { nome: "Figueirense", abrev: "FIG", categoria: "Serie C", liga: "Brasileirão Série C", personalidade: "Pechincha", orcamento: 8_000_000, cidade: "Florianópolis", cores: ["#2f2f2f", "#d0d0d0"] },
  { nome: "Londrina", abrev: "LON", categoria: "Serie C", liga: "Brasileirão Série C", personalidade: "Formador", orcamento: 7_000_000, cidade: "Londrina", cores: ["#1e4fa0", "#0a1428"] },
  { nome: "Volta Redonda", abrev: "VOL", categoria: "Serie C", liga: "Brasileirão Série C", personalidade: "Vitrine", orcamento: 6_500_000, cidade: "Volta Redonda", cores: ["#1d7f4c", "#f0c419"] },

  // ---------- Série D ----------
  { nome: "Novo Hamburgo", abrev: "NHA", categoria: "Serie D", liga: "Brasileirão Série D", personalidade: "Pechincha", orcamento: 3_000_000, cidade: "Novo Hamburgo", cores: ["#c0392b", "#1a0f0e"] },
  { nome: "Cianorte", abrev: "CIA", categoria: "Serie D", liga: "Brasileirão Série D", personalidade: "Formador", orcamento: 2_400_000, cidade: "Cianorte", cores: ["#2b6cb0", "#1a1a1a"] },
  { nome: "Bagé Atlético", abrev: "BGA", categoria: "Serie D", liga: "Brasileirão Série D", personalidade: "Pechincha", orcamento: 1_800_000, cidade: "Bagé", cores: ["#7d3c98", "#180d22"] },
  { nome: "Santa Cruz", abrev: "STC", categoria: "Serie D", liga: "Brasileirão Série D", personalidade: "Tradicional", orcamento: 4_200_000, cidade: "Recife", cores: ["#b0202a", "#1a1a1a"] },

  // ---------- Amador ----------
  { nome: "Aimoré", abrev: "AIM", categoria: "Amador", liga: "Copa Regional Amadora", personalidade: "Formador", orcamento: 800_000, cidade: "São Leopoldo", cores: ["#2f855a", "#11251a"] },
  { nome: "Guarany de Bagé", abrev: "GUA", categoria: "Amador", liga: "Copa Regional Amadora", personalidade: "Pechincha", orcamento: 500_000, cidade: "Bagé", cores: ["#2d6a9f", "#0c1a26"] },
  { nome: "União Frederiquense", abrev: "UFR", categoria: "Amador", liga: "Copa Regional Amadora", personalidade: "Vitrine", orcamento: 350_000, cidade: "Frederico Westphalen", cores: ["#d4a017", "#1a1408"] },
  { nome: "Esportivo", abrev: "ESP", categoria: "Amador", liga: "Copa Regional Amadora", personalidade: "Formador", orcamento: 600_000, cidade: "Bento Gonçalves", cores: ["#1f7a4d", "#0c221a"] },
];

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
