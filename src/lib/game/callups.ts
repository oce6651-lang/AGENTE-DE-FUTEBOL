import { rnd } from "./generators";
import { categoriaDoAtleta } from "./season";
import { ganharReputacao, REP_XP } from "./reputation";
import type { AgeCategory, GameState, NewsItem, Player } from "./types";

/**
 * Convocações para seleções: apenas atletas de nível muito alto para a própria
 * categoria são chamados. Base (Sub-15 a Sub-20) e principal.
 */

/** Nível técnico exigido pela seleção em cada categoria. */
const EXIGENCIA_SELECAO: Partial<Record<AgeCategory, number>> = {
  "Sub-15": 46,
  "Sub-17": 56,
  "Sub-20": 68,
  Livre: 80,
};

function selecaoDe(p: Player, categoria: AgeCategory): string {
  const nome = `Seleção ${p.nacionalidade === "Brasileira" ? "Brasileira" : p.nacionalidade}`;
  return categoria === "Livre" ? `${nome} Principal` : `${nome} ${categoria}`;
}

/** Sorteia convocações da semana entre os atletas representados. */
export function convocacoesSemanais(state: GameState): { state: GameState; manchetes: string[] } {
  const manchetes: string[] = [];
  let s = state;

  for (const p of state.jogadores) {
    if (!p.clube || p.status === "Aposentado" || (p.lesaoSemanas ?? 0) > 0) continue;
    const cat = categoriaDoAtleta(p);
    const exig = EXIGENCIA_SELECAO[cat];
    if (!exig || p.atual < exig) continue;

    // já convocado para esta seleção neste ano?
    const selecao = selecaoDe(p, cat);
    if ((p.convocacoes ?? []).some(c => c.ano === s.ano && c.selecao === selecao)) continue;

    // quanto mais acima da exigência, maior a chance — ainda assim é raro
    const margem = p.atual - exig;
    const chance = Math.min(0.35, 0.01 + margem * 0.012);
    if (Math.random() > chance) continue;

    const jogos = rnd(2, 6);
    const texto = `Convocado para a ${selecao} (${jogos} jogos na data FIFA).`;
    s = {
      ...s,
      jogadores: s.jogadores.map(x => x.id !== p.id ? x : {
        ...x,
        convocacoes: [{ ano: s.ano, selecao, categoria: cat, jogos }, ...(x.convocacoes ?? [])],
        confianca: Math.min(100, x.confianca + 6),
        valorMercado: Math.round(x.valorMercado * 1.18),
        timeline: [...x.timeline, {
          ano: s.ano, mes: s.mes, semana: s.semana, tipo: "nota" as const, texto,
        }],
        historico: [...x.historico, texto],
      }),
    };
    s = ganharReputacao(s, REP_XP.transferenciaPequena);
    const not: NewsItem = {
      id: `NEW${Math.random().toString(36).slice(2, 10)}`,
      semana: s.semana, mes: s.mes, ano: s.ano,
      titulo: `${p.nome} é convocado para a ${selecao}`,
      texto: `Mais um cliente de ${s.agent.agencia} vestindo a camisa do país.`,
      tipo: "mundo",
    };
    s = { ...s, noticias: [not, ...s.noticias].slice(0, 150) };
    manchetes.push(not.titulo);
  }

  return { state: s, manchetes };
}
