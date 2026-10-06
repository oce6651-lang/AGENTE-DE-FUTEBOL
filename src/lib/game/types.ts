export type Position = "GOL" | "ZAG" | "LD" | "LE" | "VOL" | "MC" | "MEI" | "PD" | "PE" | "SA" | "ATA";
export type Foot = "Destro" | "Canhoto" | "Ambidestro";

/** Ficha completa de atributos (1-100), no nível de profundidade do Football Manager. */
export interface Attributes {
  // ---- Técnicos ----
  finalizacao: number;
  passeCurto: number;
  passeLongo: number;
  cruzamento: number;
  drible: number;
  controleBola: number;
  cabeceio: number;
  marcacao: number;
  desarme: number;
  tecnica: number;
  bolaParada: number;
  penaltis: number;
  // ---- Físicos ----
  velocidade: number;
  aceleracao: number;
  agilidade: number;
  resistencia: number;
  forca: number;
  impulsao: number;
  equilibrio: number;
  // ---- Mentais ----
  determinacao: number;
  lideranca: number;
  posicionamento: number;
  antecipacao: number;
  concentracao: number;
  decisao: number;
  compostura: number;
  visaoJogo: number;
  trabalhoEquipe: number;
  coragem: number;
  inteligenciaTatica: number;
  // ---- Específicos de goleiro ----
  reflexos: number;
  saidaGol: number;
  jogoAereo: number;
  reposicao: number;
  maoAmao: number;
  // ---- Resumos calculados ----
  fisico: number;
  mental: number;
}

/** Categoria de idade das partidas observadas nos locais. */
export type AgeCategory =
  | "Sub-11" | "Sub-13" | "Sub-15" | "Sub-17" | "Sub-18" | "Sub-20" | "Livre" | "Veterano";

export interface Player {
  id: string;
  nome: string;
  idade: number;
  posicao: Position;
  pe: Foot;
  altura: number; // cm
  /** Data de nascimento no formato DD/MM/AAAA. */
  nascimento?: string;
  cidade: string;
  /** Estado e país de nascimento — definem o clube do coração e o mercado natural. */
  estado: string;
  pais: string;
  nacionalidade: string;
  clube: string | null;
  empresario: string | null; // id da agência (jogador ou rival)
  atributos: Attributes;
  atual: number;
  potencial: number;
  personalidade: "Ambicioso" | "Humilde" | "Ganancioso" | "Calmo" | "Explosivo";
  /** Traços que temperam negociações, evolução e disciplina. */
  tracos: string[];
  /** Sonhos de carreira — influenciam aceitação de propostas. */
  sonhos: string[];
  /** Clube do coração, sempre da região onde nasceu. */
  clubeCoracao: string;
  valorMercado: number;
  salario: number;
  /** Histórico permanente por temporada, no estilo Football Manager. */
  temporadas: SeasonRecord[];
  local: string; // onde foi descoberto
  historico: string[];
  observado: number; // quantas vezes foi observado tecnicamente
  confianca: number; // 0-100 confiança do atleta/família em você
  status: string;
  timeline: TimelineEvent[];
  /** Notas de scout acumuladas nas partidas assistidas. */
  relatorios: ScoutNote[];
  /** Semente visual do avatar (cores/traços). */
  visual: number;
  /** Semanas restantes de lesão (0 = apto). */
  lesaoSemanas?: number;
  /** Ano em que o contrato com o clube atual se encerra. */
  contratoAteAno?: number;
  /** A família confia cegamente no empresário (contatos pessoais iniciais). */
  familiaConfia?: boolean;
  /** Títulos conquistados na carreira. */
  titulos?: { ano: number; competicao: string; clube: string }[];
  /** Data de saída da agência, quando arquivado. */
  saiuEm?: string;
  /** Categoria em que atua, quando promovido/rebaixado fora da faixa etária. */
  categoriaForcada?: AgeCategory;
  /** Contato pessoal do início de carreira: aparece como destaque na primeira várzea. */
  contatoInicial?: boolean;
  /** Convocações para seleções de base e principal. */
  convocacoes?: { ano: number; selecao: string; categoria: AgeCategory; jogos: number }[];
  /** Empréstimo em andamento — ao terminar, o atleta volta ao clube de origem. */
  emprestimo?: LoanSpell;
}

/** Empréstimo ativo: guarda o clube de origem e a data de retorno. */
export interface LoanSpell {
  clubeOrigem: string;
  salarioOrigem: number;
  contratoOrigemAno?: number;
  ate: { ano: number; mes: number };
  meses: number;
}

/** Uma temporada completa na carreira do atleta. */
export interface SeasonRecord {
  /** Identificador da passagem — permite várias passagens no mesmo ano. */
  id: string;
  ano: number;
  clube: string;
  categoria: string;
  liga: string;
  /** Divisão do clube na passagem (Série A, D, Elite...). */
  divisao?: string;
  jogos: number;
  gols: number;
  assistencias: number;
  overall: number;
  valorMercado: number;
  salario: number;
  /** Como o atleta chegou a este clube. */
  transferencia?: TransferRecord;
  titulos: string[];
  premios: string[];
  lesoes: string[];
  /** Cartões acumulados na temporada. */
  amarelos?: number;
  vermelhos?: number;
  /** Média das notas das partidas disputadas. */
  notaMedia?: number;
  /** Campanha detalhada por competição, no estilo Football Manager. */
  competicoes?: SeasonCompetition[];
}

/** Campanha do atleta em uma competição específica dentro da temporada. */
export interface SeasonCompetition {
  competicaoId: string;
  competicao: string;
  categoria: string;
  jogos: number;
  gols: number;
  assistencias: number;
  amarelos: number;
  vermelhos: number;
  notaMedia: number;
  /** Colocação final na competição (1 = campeão). */
  posicao?: number;
  campeao?: boolean;
}

/** Registro permanente de uma movimentação de mercado. */
export interface TransferRecord {
  tipo: "Livre" | "Empréstimo" | "Compra definitiva" | "Promoção interna" | "Base" | "Renovação" | "Renovação";
  valor: number;
  moeda: "R$" | "€";
  de: string | null;
  para: string;
  ano: number;
  mes: number;
  /** Detalhes contratuais da operação. */
  salario?: number;
  duracaoAnos?: number;
  data?: string;
}

/** Registro histórico de uma edição de competição. */
export interface CompetitionSeason {
  ano: number;
  competicaoId: string;
  competicao: string;
  categoria: string;
  campeao: string;
  vice: string;
  artilheiro?: string;
  /** Atletas da sua agência que participaram desta edição. */
  clientes?: { playerId: string; nome: string; clube: string; posicao: number }[];
}

export interface ScoutNote {
  ano: number;
  mes: number;
  semana: number;
  partida: string;
  nota: number; // 0-10 desempenho na partida
  texto: string;
}

export type TimelineType =
  | "descoberta"
  | "observacao"
  | "assinatura"
  | "peneira"
  | "aprovado"
  | "reprovado"
  | "transferencia"
  | "aposentadoria"
  | "nota";

export interface TimelineEvent {
  ano: number;
  mes: number;
  semana: number;
  tipo: TimelineType;
  texto: string;
}

export interface Tryout {
  id: string;
  playerId: string;
  clubId: string;
  enviadaAno: number;
  enviadaMes: number;
  enviadaSemana: number;
  duracaoSemanas: number;
  restanteSemanas: number;
  status: "em_andamento" | "aprovado" | "reprovado" | "mais_tempo" | "lesionado" | "destaque" | "convocado";
  /** Peneira aberta gratuita ou inscrição paga direto no clube. */
  gratuita?: boolean;
  categoria?: AgeCategory;
  notas: string[];
  resultadoTexto?: string;
}

/** Peneira aberta divulgada por um clube. Inscrição gratuita. */
export interface OpenTryout {
  id: string;
  clubId: string;
  categoria: AgeCategory;
  idadeMax: number;
  ano: number;
  mes: number;
  semana: number;
  vagas: number;
  /** 1 a 10 — o quanto a avaliação é disputada. */
  nivel: number;
  inscritos: string[];
}

/** Resposta de um clube a uma oferta de atleta. */
export interface ClubResponse {
  clubId: string;
  clube: string;
  resultado:
    | "interessado" | "sem_orcamento" | "posicao_ocupada"
    | "abaixo_do_nivel" | "pede_teste" | "pede_informacoes" | "ignorou";
  texto: string;
}

export type ClubPersonality =
  | "Formador"       // aposta na base
  | "Imediatista"    // quer jogadores prontos
  | "Pechincha"      // só compra barato
  | "Vitrine"        // compra jovens para revender
  | "Tradicional";   // conservador, exige muito

/** Modalidade praticada pelo clube/competição. */
export type Modalidade = "campo" | "futsal";

export type Division = "Amador" | "Serie D" | "Serie C" | "Serie B" | "Serie A" | "Elite";

export interface Club {
  id: string;
  nome: string;
  abrev: string;
  categoria: Division;
  /** Competição em que o clube disputa a temporada. */
  liga: string;
  /** Todas as competições disputadas na temporada. */
  competicoes: string[];
  pais: string;
  estado: string;
  /** Futebol de campo (padrão) ou futsal. */
  modalidade?: Modalidade;
  personalidade: ClubPersonality;
  orcamento: number;
  cidade: string;
  cores: [string, string];
  tecnico: string;
  moralTecnico: number; // 0-100
  pontos: number;       // temporada corrente
  jogos: number;
  elenco: number;
  necessidades: Position[];
  interesse: string[]; // ids de jogadores
  confiancaEmVoce: number; // 0-100
  /** Qualidade específica de cada categoria de base (0-100). Define campeões diferentes por categoria. */
  forcaCategorias?: Partial<Record<AgeCategory, number>>;
  /** Investimento do clube na formação (0-100). */
  investimentoBase?: number;
}

export interface Negotiation {
  id: string;
  playerId: string;
  clubId: string;
  valorProposta: number;
  comissao: number;
  salario: number;
  status: "aberta" | "aceita" | "recusada" | "expirada" | "cancelada";
  expiraEm: number; // semanas restantes
  criadaEm: string;
  /** Natureza do negócio proposto. */
  tipo?: "Compra definitiva" | "Empréstimo" | "Livre" | "Renovação";
  /** Duração do contrato oferecido, em anos. */
  duracaoAnos?: number;
  /** Categoria em que o clube pretende utilizar o atleta. */
  categoria?: AgeCategory;
  /** Motivo do encerramento, quando cancelada. */
  motivo?: string;
  /** Linha do tempo da negociação. */
  etapas?: { data: string; texto: string }[];
  /** Duração do empréstimo, em meses. */
  duracaoMeses?: number;
  /** Rodadas de negociação já usadas — a paciência do clube é limitada. */
  rodadas?: number;
  /** Nasceu de um leilão? */
  origem?: "leilao" | "sondagem" | "oferta" | "peneira" | "renovacao";
}

/** Leilão aberto pelo empresário: clubes disputam o atleta por algumas semanas. */
export interface AuctionBid {
  clubId: string;
  clube: string;
  valor: number;
  salario: number;
  duracaoAnos: number;
  quando: string;
}

export interface Auction {
  id: string;
  playerId: string;
  status: "aberto" | "encerrado" | "cancelado" | "deserto";
  semanasRestantes: number;
  abertoEm: string;
  pisoValor: number;
  pisoSalario: number;
  lances: AuctionBid[];
  vencedorClubId?: string;
}

export interface RivalAgent {
  id: string;
  nome: string;
  agencia: string;
  reputacao: number;
  clientes: number;
}

export interface NewsItem {
  id: string;
  semana: number;
  mes: number;
  ano: number;
  titulo: string;
  texto: string;
  tipo: "info" | "mercado" | "financeiro" | "descoberta" | "mundo";
}

export interface FinanceEntry {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
}

export interface Agent {
  id: string;
  nome: string;
  sobrenome: string;
  nacionalidade: string;
  pais: string;
  estado: string;
  cidade: string;
  agencia: string;
}

// ============ Esportes de combate ============

export type CombatSport = "MMA" | "Boxe" | "Kickboxing" | "Jiu-jítsu" | "Muay Thai";
export type CombatStage = "Origem informal" | "Formação amadora" | "MMA amador" | "Profissional regional" | "Circuito nacional" | "Cenário internacional" | "Elite mundial";
export type CombatCircuit = "informal" | "amador" | "profissional";
export type CombatTraining = "Equilibrado" | "Trocação" | "Grappling" | "Condicionamento" | "Defesa";
export interface CombatAction {
  second: number;
  round: number;
  text: string;
  fighterScore: number;
  opponentScore: number;
}
export interface CombatCareer {
  version: 1;
  stage: CombatStage;
  weeksTraining: number;
  experience: number;
  training: CombatTraining;
  gymLevel: number;
  informalRecord: CombatRecord;
  amateurRecord: CombatRecord;
  professionalRecord: CombatRecord;
  sportArchives: { sport: CombatSport; record: CombatRecord; amateurRecord: CombatRecord; professionalRecord: CombatRecord }[];
  titles: string[];
  lastFightWeek?: number;
  lastDevelopmentWeek?: number;
  development: number;
  transitionWeeks: number;
  sponsorship?: { name: string; monthlyValue: number; weeksRemaining: number; lastPaymentWeek?: number };
  origin: string;
}
export interface CombatVisit {
  id: string;
  locationId: string;
  sport: CombatSport;
  event: string;
  weekIndex: number;
  candidates: Fighter[];
  attended: boolean;
  actions: CombatAction[];
}
export type CombatStance = "Destro" | "Canhoto" | "Ambidestro";
export type CombatResult = "V" | "D" | "E" | "NC";
export type CombatMethod = "Nocaute" | "Nocaute técnico" | "Finalização" | "Pontos" | "Vantagens" | "Decisão dos árbitros" | "Desclassificação" | "Decisão unânime" | "Decisão dividida" | "Empate" | "Sem resultado";
export type CombatStrategy = "Equilibrada" | "Trocação" | "Quedas e chão" | "Defensiva" | "Buscar finalização" | "Controlar por pontos" | "Clinch e joelhadas" | "Pressão tailandesa";

export interface CombatAttributes {
  striking: number;
  grappling: number;
  wrestling: number;
  defense: number;
  power: number;
  speed: number;
  cardio: number;
  chin: number;
  fightIQ: number;
  discipline: number;
  weightCut: number;
}

export interface CombatRecord {
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
  knockouts: number;
  submissions: number;
  decisions: number;
}

export interface FightHistoryEntry {
  id: string;
  year: number;
  month: number;
  week: number;
  opponent: string;
  event: string;
  organization: string;
  result: CombatResult;
  method: CombatMethod;
  round: number;
  time: string;
  purse: number;
  titleFight: boolean;
  weightClass: string;
  /** Formato específico da modalidade, como kimono ou sem kimono. */
  format?: "Com kimono" | "Sem kimono" | "Muay Thai";
  score?: string;
  sport?: CombatSport;
  circuit?: CombatCircuit;
  actions?: CombatAction[];
  report?: string;
}

export interface CombatContract {
  organizationId: string;
  fightsRemaining: number;
  guaranteedPurse: number;
  winBonus: number;
  agencyCommission: number;
  expiresYear: number;
  exclusive?: boolean;
}

export interface ScheduledFight {
  id: string;
  opponent: string;
  opponentRating: number;
  organizationId: string;
  event: string;
  weeksRemaining: number;
  campWeeks: number;
  campProgress: number;
  weightProgress: number;
  strategy: CombatStrategy;
  rounds: number;
  format?: "Com kimono" | "Sem kimono" | "Muay Thai";
  titleFight: boolean;
  purse: number;
  winBonus: number;
  circuit?: CombatCircuit;
  roundSeconds?: number;
  fee?: number;
  negotiatedFights?: number;
}

export interface Fighter {
  id: string;
  name: string;
  sport: CombatSport;
  age: number;
  birthDate: string;
  nationality: string;
  city: string;
  height: number;
  reach: number;
  weight: number;
  weightClass: string;
  stance: CombatStance;
  style: string;
  /** Graduação usada no circuito profissional de jiu-jítsu. */
  belt?: "Faixa-branca" | "Faixa-azul" | "Faixa-roxa" | "Faixa-marrom" | "Faixa-preta";
  gym: string;
  coach: string;
  attributes: CombatAttributes;
  rating: number;
  potential: number;
  condition: number;
  morale: number;
  popularity: number;
  trust: number;
  scouted: number;
  represented: boolean;
  status: string;
  organizationId?: string;
  rank?: number;
  champion?: boolean;
  injuryWeeks?: number;
  record: CombatRecord;
  fightHistory: FightHistoryEntry[];
  contract?: CombatContract;
  scheduledFight?: ScheduledFight;
  goals: string[];
  rivalries: string[];
  timeline: string[];
  career?: CombatCareer;
  scoutReports?: { weekIndex: number; location: string; text: string }[];
}

export interface CombatOrganization {
  id: string;
  name: string;
  sport: CombatSport;
  country: string;
  level: number;
  prestige: number;
  weightClasses: string[];
  colors: [string, string];
}

export interface CombatOffer {
  id: string;
  fighterId: string;
  organizationId: string;
  opponent: string;
  opponentRating: number;
  event: string;
  purse: number;
  winBonus: number;
  contractFights: number;
  weeksUntilFight: number;
  titleFight: boolean;
  status: "aberta" | "aceita" | "recusada";
  expiresIn: number;
  circuit?: CombatCircuit;
  fee?: number;
  negotiations?: number;
  durationYears?: number;
  exclusive?: boolean;
}

export interface GameState {
  agent: Agent;
  ano: number;
  mes: number;
  semana: number;
  dinheiro: number;
  prestigio: number; // 1-5
  reputacao: number; // 0-100
  /** Experiência acumulada de reputação. Nunca diminui. */
  repXP: number;
  energia: number;   // ações por semana
  energiaMax: number;
  jogadores: Player[];   // representados por você
  radar: Player[];       // atletas mapeados, ainda não assinados
  /** Arquivo permanente de todos os atletas que já passaram pela agência. */
  historicoAgencia: Player[];
  clubes: Club[];
  rivais: RivalAgent[];
  negociacoes: Negotiation[];
  peneiras: Tryout[];
  /** Peneiras gratuitas divulgadas pelos clubes. */
  peneirasAbertas: OpenTryout[];
  /** Campeões de cada competição por temporada. */
  titulosMundo: { ano: number; competicao: string; campeao: string }[];
  /** Histórico completo de todas as edições de competições. */
  historicoCompeticoes: CompetitionSeason[];
  noticias: NewsItem[];
  financas: FinanceEntry[];
  /** Melhorias estruturais compradas pela agência. */
  upgrades: string[];
  /** Locais de scouting já desbloqueados manualmente (além dos liberados por reputação). */
  locaisVisitados: string[];
  /** Contatos pessoais ainda não avistados em campo (aparecem na primeira várzea). */
  contatosPendentes?: Player[];
  /** Foto da agência no início do ano — base do resumo de fim de temporada. */
  snapshotInicioAno?: {
    ano: number;
    dinheiro: number;
    reputacao: number;
    jogadores: Record<string, { ovr: number; valor: number }>;
  };
  /** Resumos de fim de temporada, do mais recente para o mais antigo. */
  resumosTemporada?: SeasonSummary[];
  /** Competições criadas ou editadas pelo painel administrativo. */
  competicoesCustom?: import("./data/leagues").Competition[];
  /** Leilões de atletas abertos pela agência. */
  leiloes?: Auction[];
  /** Núcleo de esportes de combate da mesma agência. */
  combatFighters?: Fighter[];
  combatRadar?: Fighter[];
  combatOrganizations?: CombatOrganization[];
  combatOffers?: CombatOffer[];
  combatHistory?: Fighter[];
  combatReputation?: Record<CombatSport, number>;
  combatVisits?: CombatVisit[];
  seed: number;
  criadoEm: string;
  atualizadoEm: string;
}

/** Linha do resumo de fim de temporada de um cliente. */
export interface SeasonSummaryPlayer {
  playerId: string;
  nome: string;
  clube: string;
  categoria: string;
  ovrInicio: number;
  ovrFim: number;
  valorInicio: number;
  valorFim: number;
  jogos: number;
  gols: number;
  assistencias: number;
  notaMedia: number;
  titulos: string[];
}

/** Balanço completo de uma temporada da agência. */
export interface SeasonSummary {
  ano: number;
  dinheiroInicio: number;
  dinheiroFim: number;
  reputacaoInicio: number;
  reputacaoFim: number;
  clientes: number;
  titulos: number;
  receita: number;
  despesa: number;
  jogadores: SeasonSummaryPlayer[];
  destaques: string[];
}

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export const CATEGORIAS: AgeCategory[] = [
  "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-18", "Sub-20", "Livre", "Veterano",
];

// ============ Partidas (não persistidas) ============

export interface MatchPlayer {
  player: Player;
  numero: number;
  nota: number;
  titular: boolean;
  minutos: number;
  gols: number;
  destaque: boolean;
}

export interface MatchTeam {
  nome: string;
  abrev: string;
  cores: [string, string];
  tecnico: string;
  formacao: string;
  titulares: MatchPlayer[];
  reservas: MatchPlayer[];
  gols: number;
}

export interface MatchEvent {
  minuto: number;
  tipo: "apito" | "gol" | "chance" | "defesa" | "falta" | "cartao" | "substituicao" | "lance" | "fim";
  lado: "casa" | "fora" | "neutro";
  texto: string;
  playerId?: string;
}

export interface Fixture {
  id: string;
  local: string;
  categoria: AgeCategory;
  casa: MatchTeam;
  fora: MatchTeam;
  arbitro: string;
  horario: string;
  publico: number;
  custoIngresso: number;
}
