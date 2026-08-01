import type { GameState } from "./types";

/**
 * Reputação de 0 a 100 que NUNCA diminui.
 * A curva é propositalmente cruel: rápida no começo, quase parada depois do 28.
 */
export function xpNecessario(nivel: number): number {
  if (nivel < 10) return 10 + nivel * 4;                       // primeiros contatos
  if (nivel < 20) return 60 + (nivel - 10) * 14;               // conhecido na região
  if (nivel < 28) return 220 + (nivel - 20) * 45;              // boas negociações
  return 620 + Math.round(Math.pow(nivel - 27, 1.85) * 130);   // grandes conquistas
}

export function nivelPorXP(xp: number): { nivel: number; restante: number; proximo: number } {
  let nivel = 0;
  let restante = xp;
  while (nivel < 100) {
    const custo = xpNecessario(nivel);
    if (restante < custo) return { nivel, restante, proximo: custo };
    restante -= custo;
    nivel += 1;
  }
  return { nivel: 100, restante: 0, proximo: 0 };
}

/** Quanto cada conquista vale em experiência de reputação. */
export const REP_XP = {
  primeiroContato: 4,
  assinatura: 12,
  peneiraAprovada: 25,
  peneiraDestaque: 45,
  palcoDeElite: 6,
  transferenciaPequena: 30,
  transferenciaMedia: 90,
  transferenciaGrande: 240,
  transferenciaInternacional: 420,
  atletaNaSerieA: 160,
  atletaNaSelecao: 500,
  premioMelhorEmpresario: 700,
  estrutura: 20,
} as const;

/** Aplica ganho de reputação (nunca negativo) e recalcula o nível. */
export function ganharReputacao(state: GameState, xp: number): GameState {
  if (xp <= 0) return state;
  const repXP = (state.repXP ?? 0) + xp;
  const { nivel } = nivelPorXP(repXP);
  return { ...state, repXP, reputacao: Math.max(state.reputacao, nivel) };
}

export function progressoReputacao(state: GameState) {
  const { nivel, restante, proximo } = nivelPorXP(state.repXP ?? 0);
  return { nivel, restante, proximo, percentual: proximo ? Math.round((restante / proximo) * 100) : 100 };
}

export function faseReputacao(nivel: number): string {
  if (nivel < 10) return "Desconhecido";
  if (nivel < 20) return "Conhecido na região";
  if (nivel < 28) return "Respeitado no estado";
  if (nivel < 45) return "Nome nacional";
  if (nivel < 70) return "Agência de referência";
  if (nivel < 90) return "Poder no mercado";
  return "Lenda do futebol mundial";
}