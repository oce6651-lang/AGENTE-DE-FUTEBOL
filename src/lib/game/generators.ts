import type {
  Club, Division, Player, Position, Foot,
  TimelineEvent, AgeCategory, RivalAgent,
} from "./types";
import { gerarAtributos, calcularOverall } from "./attributes";
import { CLUB_SEEDS, clubesDaRegiao } from "./data/clubs";
import { competicoesDoClube, ligaPrincipal } from "./data/leagues";
import { SONHOS, TRACOS } from "./data/dreams";
import { getPais } from "./data/geo";

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

export { gerarAtributos };

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
  estado?: string;
  pais?: string;
  /** Força uma faixa específica de overall/potencial (usado nos contatos iniciais). */
  forcarAtual?: [number, number];
  forcarPotencial?: [number, number];
  forcarIdade?: number;
}

/**
 * Valor de mercado em reais, calibrado com o futebol real: garotos de várzea
 * valem centenas de reais, e apenas atletas de altíssimo nível chegam aos milhões.
 */
export function calcularValorMercado(
  atual: number, potencial: number, idade: number, temClube: boolean, divisao?: Division,
): number {
  const base = Math.pow(Math.max(1, atual) / 100, 6.2) * 90_000_000;
  const fatorPot = 1 + Math.max(0, potencial - atual) / 45;
  const fatorIdade = idade <= 16 ? 0.7 : idade <= 18 ? 1.15 : idade <= 23 ? 1.35 : idade <= 27 ? 1 : idade <= 31 ? 0.55 : 0.18;
  const fatorDivisao: Record<Division, number> = {
    Amador: 0.12, "Serie D": 0.35, "Serie C": 0.6, "Serie B": 0.85, "Serie A": 1.15, Elite: 1.8,
  };
  const fatorClube = temClube ? (divisao ? fatorDivisao[divisao] : 0.6) : 0.12;
  const bruto = base * fatorPot * fatorIdade * fatorClube;
  if (bruto < 1000) return Math.max(0, Math.round(bruto / 50) * 50);
  if (bruto < 100_000) return Math.round(bruto / 500) * 500;
  if (bruto < 1_000_000) return Math.round(bruto / 10_000) * 10_000;
  return Math.round(bruto / 100_000) * 100_000;
}

/** Salário mensal realista conforme nível técnico e divisão do clube. */
export function calcularSalario(atual: number, temClube: boolean, divisao?: Division): number {
  if (!temClube) return 0;
  const piso: Record<Division, number> = {
    Amador: 0, "Serie D": 1_200, "Serie C": 2_500, "Serie B": 6_000, "Serie A": 15_000, Elite: 60_000,
  };
  const teto: Record<Division, number> = {
    Amador: 1_500, "Serie D": 8_000, "Serie C": 25_000, "Serie B": 90_000, "Serie A": 600_000, Elite: 4_000_000,
  };
  const d = divisao ?? "Serie D";
  const t = Math.max(0, Math.min(1, (atual - 20) / 70));
  const bruto = piso[d] + (teto[d] - piso[d]) * Math.pow(t, 2.6);
  return Math.round(bruto / 100) * 100;
}

/** Sorteia sonhos coerentes com o perfil do atleta. */
export function sortearSonhos(clubeCoracao: string, potencial: number): string[] {
  const pool = SONHOS.filter(s => {
    if (s === "Ser campeão da Champions League" && potencial < 78) return false;
    if (s === "Jogar apenas em clubes grandes" && potencial < 70) return false;
    return true;
  });
  const escolhidos = new Set<string>();
  if (Math.random() < 0.4) escolhidos.add("Defender o clube do coração");
  while (escolhidos.size < rnd(2, 3)) escolhidos.add(pick(pool));
  return Array.from(escolhidos).map(s => s === "Defender o clube do coração" ? `Defender o ${clubeCoracao}` : s);
}

function sortearTracos(): string[] {
  const set = new Set<string>();
  while (set.size < rnd(2, 4)) set.add(pick(TRACOS));
  return Array.from(set);
}

export function gerarJogador(opts: GerarPlayerOpts): Player {
  const {
    cidade, local, nextId, ano, mes, semana, categoria, posicao, nivel = 1,
    estado = "RS", pais = "Brasil", forcarAtual, forcarPotencial, forcarIdade,
  } = opts;
  const [minI, maxI] = categoria ? faixaIdade(categoria) : [12, 22];
  const idade = forcarIdade ?? rnd(minI, maxI);
  const pos = posicao ?? pick(POSICOES);
  const potencial = forcarPotencial ? rnd(forcarPotencial[0], forcarPotencial[1]) : rolarPotencial(nivel);
  // Quanto mais jovem, maior a distância entre o nível atual e o potencial.
  // Palcos de elite já entregam atletas mais desenvolvidos para a idade.
  const gap = Math.max(6, 58 - idade * 2 - nivel);
  // Teto de nível por palco: na várzea ninguém é profissional pronto.
  // Uma pequena fração de atletas fura o teto (as joias escondidas).
  const teto = 16 + nivel * 6 + (Math.random() < 0.04 ? rnd(6, 20) : 0);
  const atual = forcarAtual
    ? Math.min(potencial, rnd(forcarAtual[0], forcarAtual[1]))
    : Math.max(5, Math.min(potencial, teto, rnd(potencial - gap - 5, potencial - gap + 5)));
  const nome = `${pick(NOMES)} ${pick(SOBRENOMES)}`;
  const clubeCoracao = pick(clubesDaRegiao(estado)).nome;
  const atributos = gerarAtributos(atual, pos);
  const overall = calcularOverall(atributos, pos);
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
    nascimento: gerarNascimento(idade, ano),
    cidade,
    estado,
    pais,
    nacionalidade: getPais(pais).nacionalidade,
    clube: null,
    empresario: null,
    atributos,
    atual: overall,
    potencial: Math.max(overall, potencial),
    personalidade: pick(PERSONALIDADES),
    tracos: sortearTracos(),
    sonhos: sortearSonhos(clubeCoracao, potencial),
    clubeCoracao,
    valorMercado: calcularValorMercado(overall, potencial, idade, false),
    salario: 0,
    temporadas: [],
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

/** Data de nascimento coerente com a idade e o ano corrente do jogo. */
export function gerarNascimento(idade: number, ano: number): string {
  const dia = rnd(1, 28);
  const mes = rnd(1, 12);
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano - idade}`;
}

/** Liga principal por divisão (compatibilidade com o mundo). */
export const LIGAS: Record<Division, string> = {
  Amador: "Campeonato Amador Municipal",
  "Serie D": "Brasileirão Série D",
  "Serie C": "Brasileirão Série C",
  "Serie B": "Brasileirão Série B",
  "Serie A": "Brasileirão Série A",
  Elite: "Liga Internacional",
};

export function gerarClubes(): Club[] {
  return CLUB_SEEDS.map((c, i) => {
    // Investimento na base define o quão fortes são as categorias do clube.
    const investimentoBase = Math.max(5, Math.min(100,
      { Amador: 12, "Serie D": 22, "Serie C": 34, "Serie B": 48, "Serie A": 66, Elite: 78 }[c.categoria]
      + (c.personalidade === "Formador" ? 22 : c.personalidade === "Vitrine" ? 14 : c.personalidade === "Imediatista" ? -18 : 0)
      + rnd(-14, 14)));
    // Cada categoria tem sua própria geração: nenhum clube domina tudo.
    const cats: AgeCategory[] = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-18", "Sub-20", "Livre"];
    const forcaCategorias: Partial<Record<AgeCategory, number>> = {};
    for (const cat of cats) {
      forcaCategorias[cat] = cat === "Livre"
        ? Math.max(5, Math.min(100, investimentoBase * 0.4 + 40 + rnd(-10, 10)))
        : Math.max(5, Math.min(100, investimentoBase + rnd(-28, 28)));
    }
    return {
    id: rid("CLB", i + 1),
    nome: c.nome,
    abrev: c.abrev,
    categoria: c.categoria,
    pais: c.pais,
    estado: c.estado,
    cidade: c.cidade,
    cores: c.cores,
    personalidade: c.personalidade,
    orcamento: c.orcamentoK * 1000,
    liga: ligaPrincipal(c.categoria, c.pais),
    competicoes: competicoesDoClube(c.categoria, c.pais, c.estado).map(x => x.nome),
    tecnico: pick(TECNICOS),
    moralTecnico: rnd(45, 80),
    pontos: 0,
    jogos: 0,
    elenco: rnd(22, 30),
    necessidades: [pick(POSICOES), pick(POSICOES)],
    interesse: [] as string[],
    investimentoBase,
    forcaCategorias,
    // Clubes pequenos da região são os únicos que atendem um empresário iniciante.
    confiancaEmVoce: c.categoria === "Amador" ? rnd(6, 18) : c.categoria === "Serie D" ? rnd(0, 6) : 0,
    };
  });
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
