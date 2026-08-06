import type { GameState } from "./types";

/**
 * Janelas de transferência. Cada país abre duas por ano — é nelas que a
 * imensa maioria das propostas aparece. Fora delas o mercado praticamente para.
 */
export interface TransferWindow {
  nome: string;
  meses: number[];
}

const JANELAS: Record<string, TransferWindow[]> = {
  Brasil: [
    { nome: "Janela de pré-temporada", meses: [1, 2, 3] },
    { nome: "Janela do meio do ano", meses: [7, 8] },
  ],
};

const PADRAO: TransferWindow[] = [
  { nome: "Janela de verão", meses: [7, 8] },
  { nome: "Janela de inverno", meses: [1] },
];

export function janelasDoPais(pais: string): TransferWindow[] {
  return JANELAS[pais] ?? PADRAO;
}

/** A janela do país está aberta neste mês do calendário? */
export function janelaAberta(mes: number, pais = "Brasil"): boolean {
  return janelasDoPais(pais).some(j => j.meses.includes(mes));
}

export function janelaAtual(mes: number, pais = "Brasil"): TransferWindow | null {
  return janelasDoPais(pais).find(j => j.meses.includes(mes)) ?? null;
}

/** Rótulo pronto para a interface. */
export function statusJanela(state: GameState, pais = "Brasil"): string {
  const j = janelaAtual(state.mes, pais);
  if (j) return `${j.nome} aberta`;
  const proxima = janelasDoPais(pais)
    .flatMap(x => x.meses.map(m => ({ nome: x.nome, m })))
    .map(x => ({ ...x, dist: (x.m - state.mes + 12) % 12 }))
    .sort((a, b) => a.dist - b.dist)[0];
  return `Janela fechada • abre em ${proxima.dist} mês(es)`;
}

/** Peso multiplicador das propostas conforme a janela. */
export function fatorJanela(mes: number, pais = "Brasil"): number {
  return janelaAberta(mes, pais) ? 1 : 0.12;
}
