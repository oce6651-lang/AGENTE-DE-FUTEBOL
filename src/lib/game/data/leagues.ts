import type { AgeCategory, Division, Modalidade } from "../types";

export type CompetitionType =
  | "nacional" | "copa" | "continental" | "estadual" | "base" | "amadora" | "regional";

export interface Competition {
  id: string;
  nome: string;
  pais: string;
  tipo: CompetitionType;
  /** Divisões que disputam a competição. */
  divisoes: Division[];
  categorias: AgeCategory[];
  /** Janela do calendário (mês inicial e final). */
  mesInicio: number;
  mesFim: number;
  /** Estados participantes (apenas em estaduais/regionais). */
  estados?: string[];
  /** Modalidade da competição — futebol de campo (padrão) ou futsal. */
  modalidade?: Modalidade;
}

const PRO: AgeCategory[] = ["Livre"];
const BASE: AgeCategory[] = ["Sub-13", "Sub-15", "Sub-17", "Sub-20"];

export const COMPETICOES: Competition[] = [
  // ---------- Nacionais ----------
  { id: "bra-a", nome: "Brasileirão Série A", pais: "Brasil", tipo: "nacional", divisoes: ["Serie A"], categorias: PRO, mesInicio: 4, mesFim: 12 },
  { id: "bra-b", nome: "Brasileirão Série B", pais: "Brasil", tipo: "nacional", divisoes: ["Serie B"], categorias: PRO, mesInicio: 4, mesFim: 11 },
  { id: "bra-c", nome: "Brasileirão Série C", pais: "Brasil", tipo: "nacional", divisoes: ["Serie C"], categorias: PRO, mesInicio: 4, mesFim: 10 },
  { id: "bra-d", nome: "Brasileirão Série D", pais: "Brasil", tipo: "nacional", divisoes: ["Serie D"], categorias: PRO, mesInicio: 4, mesFim: 9 },

  // ---------- Copas ----------
  { id: "copa-brasil", nome: "Copa do Brasil", pais: "Brasil", tipo: "copa", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 9 },
  { id: "copa-nordeste", nome: "Copa do Nordeste", pais: "Brasil", tipo: "copa", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["BA", "CE", "PE", "RN", "PB", "AL", "SE", "PI", "MA"] },
  { id: "copa-verde", nome: "Copa Verde", pais: "Brasil", tipo: "copa", divisoes: ["Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 2, mesFim: 6, estados: ["PA", "AM", "AC", "RO", "RR", "AP", "TO", "MT", "MS", "DF", "ES"] },

  // ---------- Continentais ----------
  { id: "libertadores", nome: "CONMEBOL Libertadores", pais: "América do Sul", tipo: "continental", divisoes: ["Serie A", "Elite"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "sulamericana", nome: "CONMEBOL Sul-Americana", pais: "América do Sul", tipo: "continental", divisoes: ["Serie A", "Serie B"], categorias: PRO, mesInicio: 3, mesFim: 11 },
  { id: "champions", nome: "UEFA Champions League", pais: "Europa", tipo: "continental", divisoes: ["Elite"], categorias: PRO, mesInicio: 9, mesFim: 5 },
  { id: "europa-league", nome: "UEFA Europa League", pais: "Europa", tipo: "continental", divisoes: ["Elite"], categorias: PRO, mesInicio: 9, mesFim: 5 },

  // ---------- Estaduais ----------
  { id: "gauchao", nome: "Campeonato Gaúcho", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["RS"] },
  { id: "paulistao", nome: "Campeonato Paulista", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["SP"] },
  { id: "carioca", nome: "Campeonato Carioca", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["RJ"] },
  { id: "mineiro", nome: "Campeonato Mineiro", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["MG"] },
  { id: "paranaense", nome: "Campeonato Paranaense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["PR"] },
  { id: "catarinense", nome: "Campeonato Catarinense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["SC"] },
  { id: "baiano", nome: "Campeonato Baiano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["BA"] },
  { id: "pernambucano", nome: "Campeonato Pernambucano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["PE"] },
  { id: "cearense", nome: "Campeonato Cearense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["CE"] },
  { id: "goiano", nome: "Campeonato Goiano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["GO", "DF"] },
  { id: "capixaba", nome: "Campeonato Capixaba", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["ES"] },
  { id: "matogrossense", nome: "Campeonato Mato-Grossense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["MT"] },
  { id: "sulmatogrossense", nome: "Campeonato Sul-Mato-Grossense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["MS"] },
  { id: "paraibano", nome: "Campeonato Paraibano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["PB"] },
  { id: "potiguar", nome: "Campeonato Potiguar", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["RN"] },
  { id: "alagoano", nome: "Campeonato Alagoano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["AL"] },
  { id: "sergipano", nome: "Campeonato Sergipano", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["SE"] },
  { id: "maranhense", nome: "Campeonato Maranhense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["MA"] },
  { id: "paraense", nome: "Campeonato Paraense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["PA"] },
  { id: "amazonense", nome: "Campeonato Amazonense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["AM"] },
  { id: "piauiense", nome: "Campeonato Piauiense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["PI"] },
  { id: "brasiliense", nome: "Campeonato Brasiliense", pais: "Brasil", tipo: "estadual", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 1, mesFim: 4, estados: ["DF"] },

  // ---------- Supercopas e mundiais ----------
  { id: "supercopa-brasil", nome: "Supercopa do Brasil", pais: "Brasil", tipo: "copa", divisoes: ["Serie A"], categorias: PRO, mesInicio: 2, mesFim: 2 },
  { id: "recopa", nome: "CONMEBOL Recopa", pais: "América do Sul", tipo: "continental", divisoes: ["Serie A", "Elite"], categorias: PRO, mesInicio: 2, mesFim: 3 },
  { id: "mundial-clubes", nome: "Mundial de Clubes", pais: "Mundo", tipo: "continental", divisoes: ["Serie A", "Elite"], categorias: PRO, mesInicio: 6, mesFim: 7 },

  // ---------- Base ----------
  { id: "copinha", nome: "Copa São Paulo de Futebol Júnior", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: ["Sub-20"], mesInicio: 1, mesFim: 1 },
  { id: "bra-sub20", nome: "Brasileirão Sub-20", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-20"], mesInicio: 5, mesFim: 11 },
  { id: "bra-sub17", nome: "Brasileirão Sub-17", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-17"], mesInicio: 5, mesFim: 11 },
  { id: "copa-brasil-sub20", nome: "Copa do Brasil Sub-20", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-20"], mesInicio: 4, mesFim: 8 },
  { id: "copa-brasil-sub17", nome: "Copa do Brasil Sub-17", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-17"], mesInicio: 4, mesFim: 8 },
  { id: "estadual-base", nome: "Estadual de Base", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: BASE, mesInicio: 3, mesFim: 10 },
  { id: "copa-sub23", nome: "Copa Nacional Sub-23", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-20", "Livre"], mesInicio: 6, mesFim: 10 },
  { id: "bra-sub15", nome: "Brasileirão Sub-15", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-15"], mesInicio: 5, mesFim: 11 },
  { id: "copa-brasil-sub15", nome: "Copa do Brasil Sub-15", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-15"], mesInicio: 4, mesFim: 8 },
  { id: "copa-2julho", nome: "Copa 2 de Julho", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: ["Sub-15"], mesInicio: 7, mesFim: 7 },
  { id: "taca-belo-horizonte", nome: "Taça BH de Juniores", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: ["Sub-17"], mesInicio: 10, mesFim: 11 },
  { id: "libertadores-sub20", nome: "Libertadores Sub-20", pais: "América do Sul", tipo: "base", divisoes: ["Serie A", "Elite"], categorias: ["Sub-20"], mesInicio: 2, mesFim: 3 },
  { id: "youth-league", nome: "UEFA Youth League", pais: "Europa", tipo: "base", divisoes: ["Elite"], categorias: ["Sub-20"], mesInicio: 9, mesFim: 4 },

  // ---------- Amadoras e regionais ----------
  { id: "amadora", nome: "Campeonato Amador Municipal", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-15", "Sub-17", "Sub-20", "Livre", "Veterano"], mesInicio: 3, mesFim: 11 },
  { id: "regional", nome: "Copa Regional do Interior", pais: "Brasil", tipo: "regional", divisoes: ["Amador", "Serie D"], categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre"], mesInicio: 5, mesFim: 9 },
  { id: "varzeano", nome: "Copa Várzea", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Livre", "Veterano"], mesInicio: 1, mesFim: 12 },
  { id: "copa-interior", nome: "Copa do Interior", pais: "Brasil", tipo: "regional", divisoes: ["Amador", "Serie D", "Serie C"], categorias: ["Sub-15", "Sub-17", "Sub-20", "Livre"], mesInicio: 4, mesFim: 8 },
  { id: "torneio-integracao", nome: "Torneio de Integração Municipal", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-13", "Sub-15", "Sub-17", "Livre"], mesInicio: 2, mesFim: 6 },

  // ---------- Competições continentais de base ----------
  { id: "sudamericana-sub17", nome: "CONMEBOL Sub-17 de Clubes", pais: "América do Sul", tipo: "base", divisoes: ["Serie A", "Elite"], categorias: ["Sub-17"], mesInicio: 3, mesFim: 4 },

  { id: "supercopa-rei", nome: "Supercopa Rei da Base", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-17", "Sub-20"], mesInicio: 2, mesFim: 3 },
  { id: "copa-brasil-sub13", nome: "Copa do Brasil Sub-13", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-13"], mesInicio: 4, mesFim: 8 },
  { id: "bra-sub13", nome: "Brasileirão Sub-13", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-13"], mesInicio: 5, mesFim: 10 },
  { id: "copa-atlantico", nome: "Copa Atlântico de Base", pais: "Brasil", tipo: "base", divisoes: ["Serie B", "Serie C", "Serie D"], categorias: ["Sub-15", "Sub-17"], mesInicio: 6, mesFim: 9, estados: ["RJ", "ES", "BA", "SE", "AL", "PE", "PB", "RN", "CE"] },
  { id: "copa-sul", nome: "Copa Sul de Base", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: ["Sub-15", "Sub-17", "Sub-20"], mesInicio: 7, mesFim: 10, estados: ["RS", "SC", "PR"] },
  { id: "copa-centro-oeste", nome: "Copa Centro-Oeste", pais: "Brasil", tipo: "regional", divisoes: ["Serie C", "Serie D", "Amador"], categorias: ["Sub-17", "Sub-20", "Livre"], mesInicio: 5, mesFim: 8, estados: ["GO", "DF", "MT", "MS", "TO"] },
  { id: "copa-norte", nome: "Copa Norte", pais: "Brasil", tipo: "regional", divisoes: ["Serie C", "Serie D", "Amador"], categorias: ["Sub-17", "Sub-20", "Livre"], mesInicio: 5, mesFim: 8, estados: ["PA", "AM", "AC", "RO", "RR", "AP", "TO"] },
  { id: "torneio-verao", nome: "Torneio de Verão da Várzea", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre", "Veterano"], mesInicio: 12, mesFim: 2 },
  { id: "copa-escolar", nome: "Copa Escolar Estadual", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17"], mesInicio: 8, mesFim: 11 },

  // ---------- Ligas nacionais estrangeiras ----------
  { id: "laliga", nome: "La Liga", pais: "Espanha", tipo: "nacional", divisoes: ["Elite"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "laliga2", nome: "La Liga 2", pais: "Espanha", tipo: "nacional", divisoes: ["Serie A", "Serie B"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "premier", nome: "Premier League", pais: "Inglaterra", tipo: "nacional", divisoes: ["Elite"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "serie-a-ita", nome: "Serie A (ITA)", pais: "Itália", tipo: "nacional", divisoes: ["Elite"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "serie-b-ita", nome: "Serie B (ITA)", pais: "Itália", tipo: "nacional", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "primeira-liga", nome: "Primeira Liga", pais: "Portugal", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "liga-portugal-2", nome: "Liga Portugal 2", pais: "Portugal", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "ligue1", nome: "Ligue 1", pais: "França", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "bundesliga", nome: "Bundesliga", pais: "Alemanha", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "eredivisie", nome: "Eredivisie", pais: "Holanda", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "pro-league", nome: "Jupiler Pro League", pais: "Bélgica", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "liga-argentina", nome: "Liga Profesional", pais: "Argentina", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "primera-b-arg", nome: "Primera Nacional (ARG)", pais: "Argentina", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "primera-uru", nome: "Primera División (URU)", pais: "Uruguai", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "segunda-uru", nome: "Segunda División (URU)", pais: "Uruguai", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 3, mesFim: 11 },
  { id: "liga-mx", nome: "Liga MX", pais: "México", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 1, mesFim: 12 },
  { id: "expansion-mx", nome: "Liga de Expansión MX", pais: "México", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 1, mesFim: 12 },
  { id: "primera-chile", nome: "Primera División (CHI)", pais: "Chile", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "primera-b-chile", nome: "Primera B (CHI)", pais: "Chile", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 3, mesFim: 11 },
  { id: "liga-colombia", nome: "Liga BetPlay", pais: "Colômbia", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 1, mesFim: 12 },
  { id: "torneo-colombia", nome: "Torneo BetPlay", pais: "Colômbia", tipo: "nacional", divisoes: ["Serie B", "Serie C"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "liga-paraguai", nome: "Primera División (PAR)", pais: "Paraguai", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 1, mesFim: 12 },
  { id: "mls", nome: "Major League Soccer", pais: "EUA", tipo: "nacional", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 2, mesFim: 11 },
  { id: "j1", nome: "J1 League", pais: "Japão", tipo: "nacional", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 2, mesFim: 12 },

  // ---------- Copas nacionais estrangeiras ----------
  { id: "copa-del-rey", nome: "Copa del Rey", pais: "Espanha", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 10, mesFim: 4 },
  { id: "fa-cup", nome: "FA Cup", pais: "Inglaterra", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 11, mesFim: 5 },
  { id: "coppa-italia", nome: "Coppa Italia", pais: "Itália", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 9, mesFim: 5 },
  { id: "taca-portugal", nome: "Taça de Portugal", pais: "Portugal", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B", "Serie C"], categorias: PRO, mesInicio: 9, mesFim: 5 },
  { id: "dfb-pokal", nome: "DFB-Pokal", pais: "Alemanha", tipo: "copa", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 8, mesFim: 5 },
  { id: "coupe-france", nome: "Coupe de France", pais: "França", tipo: "copa", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 11, mesFim: 5 },
  { id: "knvb-beker", nome: "KNVB Beker", pais: "Holanda", tipo: "copa", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 9, mesFim: 4 },
  { id: "copa-argentina", nome: "Copa Argentina", pais: "Argentina", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 3, mesFim: 11 },
  { id: "copa-mx", nome: "Copa MX", pais: "México", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 3, mesFim: 10 },

  // ---------- Futsal brasileiro (apenas competições existentes) ----------
  { id: "lnf", nome: "Liga Nacional de Futsal", pais: "Brasil", tipo: "nacional", divisoes: ["Elite"], categorias: PRO, mesInicio: 3, mesFim: 12, modalidade: "futsal" },
  { id: "lnf-silver", nome: "LNF Silver", pais: "Brasil", tipo: "nacional", divisoes: ["Serie A", "Serie B"], categorias: PRO, mesInicio: 4, mesFim: 11, modalidade: "futsal" },
  { id: "taca-brasil-futsal", nome: "Taça Brasil de Futsal", pais: "Brasil", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B", "Serie C"], categorias: PRO, mesInicio: 6, mesFim: 7, modalidade: "futsal" },
  { id: "copa-brasil-futsal", nome: "Copa do Brasil de Futsal", pais: "Brasil", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 8, mesFim: 10, modalidade: "futsal" },
  { id: "supercopa-gramado-futsal", nome: "Supercopa Gramado de Futsal", pais: "Brasil", tipo: "copa", divisoes: ["Elite", "Serie A"], categorias: PRO, mesInicio: 1, mesFim: 2, modalidade: "futsal" },
  { id: "libertadores-futsal", nome: "Copa Libertadores de Futsal", pais: "América do Sul", tipo: "continental", divisoes: ["Elite"], categorias: PRO, mesInicio: 7, mesFim: 8, modalidade: "futsal" },
  { id: "intercontinental-futsal", nome: "Copa Intercontinental de Futsal", pais: "Mundo", tipo: "continental", divisoes: ["Elite"], categorias: PRO, mesInicio: 11, mesFim: 12, modalidade: "futsal" },
  { id: "taca-brasil-futsal-sub20", nome: "Taça Brasil de Futsal Sub-20", pais: "Brasil", tipo: "base", divisoes: ["Elite", "Serie A", "Serie B", "Serie C"], categorias: ["Sub-20"], mesInicio: 7, mesFim: 8, modalidade: "futsal" },
  { id: "taca-brasil-futsal-sub17", nome: "Taça Brasil de Futsal Sub-17", pais: "Brasil", tipo: "base", divisoes: ["Elite", "Serie A", "Serie B", "Serie C"], categorias: ["Sub-17"], mesInicio: 7, mesFim: 8, modalidade: "futsal" },
  { id: "taca-brasil-futsal-sub15", nome: "Taça Brasil de Futsal Sub-15", pais: "Brasil", tipo: "base", divisoes: ["Elite", "Serie A", "Serie B", "Serie C"], categorias: ["Sub-15"], mesInicio: 8, mesFim: 9, modalidade: "futsal" },

  // ---------- Estaduais de futsal (federações reais) ----------
  { id: "paranaense-futsal", nome: "Campeonato Paranaense de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["PR"], modalidade: "futsal" },
  { id: "catarinense-futsal", nome: "Campeonato Catarinense de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["SC"], modalidade: "futsal" },
  { id: "paulista-futsal", nome: "Campeonato Paulista de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["SP"], modalidade: "futsal" },
  { id: "mineiro-futsal", nome: "Campeonato Mineiro de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["MG"], modalidade: "futsal" },
  { id: "cearense-futsal", nome: "Campeonato Cearense de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["CE"], modalidade: "futsal" },
  { id: "pernambucano-futsal", nome: "Campeonato Pernambucano de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["PE"], modalidade: "futsal" },
  { id: "potiguar-futsal", nome: "Campeonato Potiguar de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["RN"], modalidade: "futsal" },
  { id: "amazonense-futsal", nome: "Campeonato Amazonense de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["AM"], modalidade: "futsal" },
  { id: "brasiliense-futsal", nome: "Campeonato Brasiliense de Futsal", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 3, mesFim: 11, estados: ["DF"], modalidade: "futsal" },
  { id: "liga-futsal-amadora", nome: "Liga Municipal de Futsal", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre", "Veterano"], mesInicio: 1, mesFim: 12, modalidade: "futsal" },


  // ---------- Futsal gaúcho: FGFS e Liga Gaúcha (LGF) ----------
  { id: "serie-ouro-rs", nome: "Campeonato Gaúcho de Futsal Série Ouro", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 5, mesFim: 12, estados: ["RS"], modalidade: "futsal" },
  { id: "serie-prata-rs", nome: "Campeonato Gaúcho de Futsal Série Prata", pais: "Brasil", tipo: "estadual", divisoes: ["Serie C"], categorias: PRO, mesInicio: 5, mesFim: 11, estados: ["RS"], modalidade: "futsal" },
  { id: "serie-bronze-rs", nome: "Campeonato Gaúcho de Futsal Série Bronze", pais: "Brasil", tipo: "estadual", divisoes: ["Serie D", "Amador"], categorias: PRO, mesInicio: 5, mesFim: 11, estados: ["RS"], modalidade: "futsal" },
  { id: "gauchao-lgf-a", nome: "Gauchão de Futsal LGF Série A", pais: "Brasil", tipo: "estadual", divisoes: ["Elite", "Serie A", "Serie B"], categorias: PRO, mesInicio: 6, mesFim: 12, estados: ["RS"], modalidade: "futsal" },
  { id: "gauchao-lgf-b", nome: "Gauchão de Futsal LGF Série B", pais: "Brasil", tipo: "estadual", divisoes: ["Serie C"], categorias: PRO, mesInicio: 5, mesFim: 11, estados: ["RS"], modalidade: "futsal" },
  { id: "gauchao-lgf-c", nome: "Gauchão de Futsal LGF Série C", pais: "Brasil", tipo: "estadual", divisoes: ["Serie D", "Amador"], categorias: PRO, mesInicio: 6, mesFim: 11, estados: ["RS"], modalidade: "futsal" },
  { id: "copa-rs-futsal", nome: "Copa RS de Futsal", pais: "Brasil", tipo: "copa", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D"], categorias: PRO, mesInicio: 5, mesFim: 9, estados: ["RS"], modalidade: "futsal" },
  { id: "copa-gaucha-futsal", nome: "Copa Gaúcha de Futsal", pais: "Brasil", tipo: "copa", divisoes: ["Serie B", "Serie C", "Serie D", "Amador"], categorias: PRO, mesInicio: 3, mesFim: 5, estados: ["RS"], modalidade: "futsal" },

  { id: "gaucho-futsal-base", nome: "Campeonato Gaúcho de Futsal de Base", pais: "Brasil", tipo: "base", divisoes: ["Elite", "Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20"], mesInicio: 3, mesFim: 10, estados: ["RS"], modalidade: "futsal" },
  { id: "gauchao-lgf-base", nome: "Gauchão de Futsal de Base LGF", pais: "Brasil", tipo: "base", divisoes: ["Serie B", "Serie C", "Serie D", "Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20"], mesInicio: 4, mesFim: 10, estados: ["RS"], modalidade: "futsal" },
];

/** Grupo temático usado para organizar a aba de competições. */
export type CompetitionGroup = "Futsal" | "Base" | "Amador e várzea" | "Copas" | "Futebol de campo";

const GRUPO_POR_NOME = new Map<string, CompetitionGroup>(
  COMPETICOES.map(c => [c.nome, grupoDaCompeticao(c)]),
);

export function grupoDaCompeticao(c: Competition): CompetitionGroup {
  if ((c.modalidade ?? "campo") === "futsal") return "Futsal";
  if (c.tipo === "base") return "Base";
  if (c.tipo === "amadora") return "Amador e várzea";
  if (c.tipo === "copa") return "Copas";
  return "Futebol de campo";
}

/** Descobre o grupo a partir do nome registrado no histórico. */
export function grupoPorNome(nome: string): CompetitionGroup {
  const direto = GRUPO_POR_NOME.get(nome);
  if (direto) return direto;
  const n = nome.toLowerCase();
  if (n.includes("futsal")) return "Futsal";
  if (/sub-\d/.test(n) || n.includes("base") || n.includes("juniores")) return "Base";
  if (n.includes("amador") || n.includes("várzea") || n.includes("municipal") || n.includes("citadino")) return "Amador e várzea";
  if (n.includes("copa") || n.includes("taça") || n.includes("cup")) return "Copas";
  return "Futebol de campo";
}

/** Liga principal de um clube, conforme divisão e país. */
export function ligaPrincipal(divisao: Division, pais: string, modalidade: Modalidade = "campo"): string {
  if (modalidade === "futsal") {
    const futsal: Record<Division, string> = {
      Amador: "Liga Municipal de Futsal",
      "Serie D": "Campeonato Estadual de Futsal",
      "Serie C": "Liga Nacional de Futsal — Divisão de Acesso",
      "Serie B": "Liga Nacional de Futsal — Divisão de Acesso",
      "Serie A": "Liga Nacional de Futsal",
      Elite: "Liga Nacional de Futsal",
    };
    return futsal[divisao];
  }
  if (pais !== "Brasil") {
    const mapa: Record<string, string> = {
      Espanha: "La Liga", Inglaterra: "Premier League", Itália: "Serie A (ITA)",
      Portugal: "Primeira Liga", Argentina: "Liga Profesional", Uruguai: "Primera División (URU)",
      França: "Ligue 1", Alemanha: "Bundesliga", Holanda: "Eredivisie", Bélgica: "Jupiler Pro League",
      México: "Liga MX", Chile: "Primera División (CHI)", Colômbia: "Liga BetPlay",
      Paraguai: "Primera División (PAR)", EUA: "Major League Soccer", Japão: "J1 League",
    };
    const segunda: Record<string, string> = {
      Espanha: "La Liga 2", Itália: "Serie B (ITA)", Portugal: "Liga Portugal 2",
      Argentina: "Primera Nacional (ARG)", Uruguai: "Segunda División (URU)",
      México: "Liga de Expansión MX", Chile: "Primera B (CHI)", Colômbia: "Torneo BetPlay",
    };
    if ((divisao === "Serie B" || divisao === "Serie C") && segunda[pais]) return segunda[pais];
    return mapa[pais] ?? "Liga Internacional";
  }
  const mapa: Record<Division, string> = {
    Amador: "Campeonato Amador Municipal",
    "Serie D": "Brasileirão Série D",
    "Serie C": "Brasileirão Série C",
    "Serie B": "Brasileirão Série B",
    "Serie A": "Brasileirão Série A",
    Elite: "Liga Internacional",
  };
  return mapa[divisao];
}

/** Todas as competições que um clube disputa no ano. */
export function competicoesDoClube(
  divisao: Division, pais: string, estado: string, modalidade: Modalidade = "campo",
): Competition[] {
  return COMPETICOES.filter(c => {
    // futsal e futebol de campo nunca se misturam
    if ((c.modalidade ?? "campo") !== modalidade) return false;
    if (!c.divisoes.includes(divisao)) return false;
    if (c.estados && !c.estados.includes(estado)) return false;
    if (c.pais === "Brasil" && pais !== "Brasil") return false;
    // ligas nacionais estrangeiras: só clubes daquele país
    if (c.tipo === "nacional" && c.pais !== "Brasil" && c.pais !== pais) return false;
    if (c.tipo === "continental") {
      if (c.id === "champions" || c.id === "europa-league") return pais !== "Brasil";
      return pais === "Brasil" || pais === "Argentina" || pais === "Uruguai";
    }
    return true;
  });
}

export function competicaoAtiva(c: Competition, mes: number): boolean {
  return c.mesInicio <= c.mesFim
    ? mes >= c.mesInicio && mes <= c.mesFim
    : mes >= c.mesInicio || mes <= c.mesFim;
}