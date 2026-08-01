import type { AgeCategory, Division } from "../types";

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

  // ---------- Base ----------
  { id: "copinha", nome: "Copa São Paulo de Futebol Júnior", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D"], categorias: ["Sub-20"], mesInicio: 1, mesFim: 1 },
  { id: "bra-sub20", nome: "Brasileirão Sub-20", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-20"], mesInicio: 5, mesFim: 11 },
  { id: "bra-sub17", nome: "Brasileirão Sub-17", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B"], categorias: ["Sub-17"], mesInicio: 5, mesFim: 11 },
  { id: "copa-brasil-sub20", nome: "Copa do Brasil Sub-20", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-20"], mesInicio: 4, mesFim: 8 },
  { id: "copa-brasil-sub17", nome: "Copa do Brasil Sub-17", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-17"], mesInicio: 4, mesFim: 8 },
  { id: "estadual-base", nome: "Estadual de Base", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C", "Serie D", "Amador"], categorias: BASE, mesInicio: 3, mesFim: 10 },
  { id: "copa-sub23", nome: "Copa Nacional Sub-23", pais: "Brasil", tipo: "base", divisoes: ["Serie A", "Serie B", "Serie C"], categorias: ["Sub-20", "Livre"], mesInicio: 6, mesFim: 10 },

  // ---------- Amadoras e regionais ----------
  { id: "amadora", nome: "Campeonato Amador Municipal", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-15", "Sub-17", "Sub-20", "Livre", "Veterano"], mesInicio: 3, mesFim: 11 },
  { id: "regional", nome: "Copa Regional do Interior", pais: "Brasil", tipo: "regional", divisoes: ["Amador", "Serie D"], categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre"], mesInicio: 5, mesFim: 9 },
  { id: "varzeano", nome: "Copa Várzea", pais: "Brasil", tipo: "amadora", divisoes: ["Amador"], categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Livre", "Veterano"], mesInicio: 1, mesFim: 12 },
];

/** Liga principal de um clube, conforme divisão e país. */
export function ligaPrincipal(divisao: Division, pais: string): string {
  if (pais !== "Brasil") {
    const mapa: Record<string, string> = {
      Espanha: "La Liga", Inglaterra: "Premier League", Itália: "Serie A (ITA)",
      Portugal: "Primeira Liga", Argentina: "Liga Profesional", Uruguai: "Primera División (URU)",
    };
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
export function competicoesDoClube(divisao: Division, pais: string, estado: string): Competition[] {
  return COMPETICOES.filter(c => {
    if (!c.divisoes.includes(divisao)) return false;
    if (c.estados && !c.estados.includes(estado)) return false;
    if (c.pais === "Brasil" && pais !== "Brasil") return false;
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