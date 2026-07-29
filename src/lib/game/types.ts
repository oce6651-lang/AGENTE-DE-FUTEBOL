export type Position = "GOL" | "ZAG" | "LD" | "LE" | "VOL" | "MC" | "MEI" | "PD" | "PE" | "SA" | "ATA";
export type Foot = "Destro" | "Canhoto" | "Ambidestro";

export interface Attributes {
  tecnica: number;
  velocidade: number;
  finalizacao: number;
  passe: number;
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
  cidade: string;
  clube: string | null;
  empresario: string | null; // id da agência (jogador ou rival)
  atributos: Attributes;
  atual: number;
  potencial: number;
  personalidade: "Ambicioso" | "Humilde" | "Ganancioso" | "Calmo" | "Explosivo";
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
  status: "em_andamento" | "aprovado" | "reprovado" | "mais_tempo" | "lesionado";
  notas: string[];
  resultadoTexto?: string;
}

export type ClubPersonality =
  | "Formador"       // aposta na base
  | "Imediatista"    // quer jogadores prontos
  | "Pechincha"      // só compra barato
  | "Vitrine"        // compra jovens para revender
  | "Tradicional";   // conservador, exige muito

export type Division = "Amador" | "Serie D" | "Serie C" | "Serie B" | "Serie A" | "Elite";

export interface Club {
  id: string;
  nome: string;
  abrev: string;
  categoria: Division;
  /** Competição em que o clube disputa a temporada. */
  liga: string;
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
}

export interface Negotiation {
  id: string;
  playerId: string;
  clubId: string;
  valorProposta: number;
  comissao: number;
  salario: number;
  status: "aberta" | "aceita" | "recusada" | "expirada";
  expiraEm: number; // semanas restantes
  criadaEm: string;
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

export interface GameState {
  agent: Agent;
  ano: number;
  mes: number;
  semana: number;
  dinheiro: number;
  prestigio: number; // 1-5
  reputacao: number; // 0-100
  energia: number;   // ações por semana
  energiaMax: number;
  jogadores: Player[];   // representados por você
  radar: Player[];       // atletas mapeados, ainda não assinados
  clubes: Club[];
  rivais: RivalAgent[];
  negociacoes: Negotiation[];
  peneiras: Tryout[];
  noticias: NewsItem[];
  financas: FinanceEntry[];
  /** Melhorias estruturais compradas pela agência. */
  upgrades: string[];
  /** Locais de scouting já desbloqueados manualmente (além dos liberados por reputação). */
  locaisVisitados: string[];
  seed: number;
  criadoEm: string;
  atualizadoEm: string;
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
