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

export interface Player {
  id: string;
  nome: string;
  idade: number;
  posicao: Position;
  pe: Foot;
  altura: number; // cm
  cidade: string;
  clube: string | null;
  empresario: string | null; // agency id
  atributos: Attributes;
  atual: number;
  potencial: number;
  personalidade: "Ambicioso" | "Humilde" | "Ganancioso" | "Calmo" | "Explosivo";
  local: string; // where discovered
  historico: string[];
  observado: number; // number of times scouted
  status: string;
  timeline: TimelineEvent[];
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
  duracaoSemanas: number; // ex: 1 = ~5 dias, 2 = ~10 dias
  restanteSemanas: number;
  status: "em_andamento" | "aprovado" | "reprovado" | "mais_tempo" | "lesionado";
  notas: string[];
  resultadoTexto?: string;
}

export interface Club {
  id: string;
  nome: string;
  categoria: "Base" | "Amador" | "Serie D" | "Serie C" | "Serie B" | "Serie A" | "Elite";
  orcamento: number;
  cidade: string;
  interesse: string[]; // player ids
}

export interface Negotiation {
  id: string;
  playerId: string;
  clubId: string;
  valorProposta: number;
  comissao: number; // fraction to agent
  salario: number;
  status: "aberta" | "aceita" | "recusada";
  criadaEm: string;
}

export interface NewsItem {
  id: string;
  semana: number;
  mes: number;
  ano: number;
  titulo: string;
  texto: string;
  tipo: "info" | "mercado" | "financeiro" | "descoberta";
}

export interface FinanceEntry {
  id: string;
  data: string;
  descricao: string;
  valor: number; // + or -
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
  reputacao: number; // 0-100, cresce lentamente
  jogadores: Player[];
  clubes: Club[];
  negociacoes: Negotiation[];
  peneiras: Tryout[];
  noticias: NewsItem[];
  financas: FinanceEntry[];
  seed: number;
  criadoEm: string;
  atualizadoEm: string;
}

export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export const LOCAIS = [
  "Campo Municipal",
  "Quadra do Bairro",
  "Escolinha de Futebol",
  "Escola Estadual",
  "Várzea",
] as const;