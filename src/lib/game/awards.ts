import { rnd } from "./generators";
import { ganharReputacao, REP_XP } from "./reputation";
import { categoriaDoAtleta } from "./season";
import type { AgeCategory, GameState, NewsItem, Player, SeasonRecord } from "./types";

/**
 * Competições de seleções e premiações individuais de fim de temporada.
 * Tudo aqui roda uma vez por ano, junto do encerramento das competições de clubes.
 */

function uid(p: string) {
  return `${p}${Math.random().toString(36).slice(2, 10)}`;
}

const EUROPA = [
  "Portuguesa", "Espanhola", "Francesa", "Italiana", "Alemã", "Inglesa", "Holandesa", "Belga", "Croata",
];
const AMERICA_SUL = [
  "Brasileira", "Argentina", "Uruguaia", "Chilena", "Colombiana", "Paraguaia", "Peruana", "Equatoriana", "Boliviana", "Venezuelana",
];

export interface NationalTournament {
  id: string;
  nome: string;
  categoria: AgeCategory;
  /** Continente exigido pela nacionalidade do atleta ("mundo" = qualquer um). */
  regiao: "mundo" | "america-sul" | "europa";
  /** Acontece quando o ano satisfaz este teste. */
  ocorre: (ano: number) => boolean;
}

export const TORNEIOS_SELECOES: NationalTournament[] = [
  { id: "copa-mundo", nome: "Copa do Mundo FIFA", categoria: "Livre", regiao: "mundo", ocorre: a => a % 4 === 2 },
  { id: "olimpiadas", nome: "Jogos Olímpicos", categoria: "Sub-20", regiao: "mundo", ocorre: a => a % 4 === 0 },
  { id: "copa-america", nome: "Copa América", categoria: "Livre", regiao: "america-sul", ocorre: a => a % 4 === 0 },
  { id: "eurocopa", nome: "Eurocopa", categoria: "Livre", regiao: "europa", ocorre: a => a % 4 === 0 },
  { id: "mundial-sub20", nome: "Copa do Mundo Sub-20", categoria: "Sub-20", regiao: "mundo", ocorre: a => a % 2 === 1 },
  { id: "mundial-sub17", nome: "Copa do Mundo Sub-17", categoria: "Sub-17", regiao: "mundo", ocorre: a => a % 2 === 1 },
  { id: "sula-sub20", nome: "Sul-Americano Sub-20", categoria: "Sub-20", regiao: "america-sul", ocorre: () => true },
  { id: "sula-sub17", nome: "Sul-Americano Sub-17", categoria: "Sub-17", regiao: "america-sul", ocorre: () => true },
  { id: "sula-sub15", nome: "Sul-Americano Sub-15", categoria: "Sub-15", regiao: "america-sul", ocorre: a => a % 2 === 0 },
];

/** Torneios de seleção disputados neste ano. */
export function torneiosDoAno(ano: number): NationalTournament[] {
  return TORNEIOS_SELECOES.filter(t => t.ocorre(ano));
}

function regiaoAceita(t: NationalTournament, p: Player): boolean {
  if (t.regiao === "mundo") return true;
  if (t.regiao === "europa") return EUROPA.includes(p.nacionalidade);
  return AMERICA_SUL.includes(p.nacionalidade);
}

const FASES = ["campeão", "vice-campeão", "semifinalista", "quartas de final", "fase de grupos"] as const;

function temporadaDoAno(p: Player, ano: number): { temp: SeasonRecord; idx: number } | null {
  const temporadas = p.temporadas ?? [];
  const idx = temporadas.findIndex(t => t.ano === ano);
  return idx < 0 ? null : { temp: { ...temporadas[idx] }, idx };
}

function anotar(p: Player, ano: number, premio: string, titulo?: string): Player {
  const temporadas = [...(p.temporadas ?? [])];
  const alvo = temporadaDoAno(p, ano);
  if (alvo) {
    alvo.temp.premios = [...alvo.temp.premios, premio];
    if (titulo) alvo.temp.titulos = [...alvo.temp.titulos, titulo];
    temporadas[alvo.idx] = alvo.temp;
  }
  return {
    ...p,
    temporadas,
    titulos: titulo
      ? [...(p.titulos ?? []), { ano, competicao: titulo, clube: p.clube ?? "Seleção" }]
      : p.titulos,
    historico: [...p.historico, premio],
    timeline: [...p.timeline, { ano, mes: 12, semana: 4, tipo: "nota" as const, texto: premio }],
  };
}

/**
 * Disputa os torneios de seleções do ano com os atletas convocados e devolve as
 * campanhas registradas no histórico permanente de cada um.
 */
export function torneiosDeSelecao(state: GameState): { state: GameState; noticias: NewsItem[] } {
  const torneios = torneiosDoAno(state.ano);
  if (!torneios.length) return { state, noticias: [] };

  const noticias: NewsItem[] = [];
  let s = state;

  for (const p of state.jogadores) {
    if (p.status === "Aposentado") continue;
    const convocado = (p.convocacoes ?? []).some(c => c.ano === state.ano);
    if (!convocado) continue;
    const cat = categoriaDoAtleta(p);

    for (const t of torneios) {
      if (t.categoria !== cat || !regiaoAceita(t, p)) continue;
      // nem todo convocado entra na lista final do torneio
      if (Math.random() > Math.min(0.9, 0.35 + (p.atual - 50) * 0.012)) continue;

      const jogos = rnd(3, 7);
      const ofensivo = ["ATA", "SA", "PD", "PE", "MEI"].includes(p.posicao);
      const gols = Math.round(jogos * (p.atual / 100) * (ofensivo ? 0.45 : 0.08) * Math.random() * 2);
      const assist = Math.round(jogos * (p.atual / 100) * 0.2 * Math.random() * 2);
      const fase = FASES[Math.min(FASES.length - 1, Math.max(0, Math.floor(Math.random() * 5) - (p.atual > 85 ? 1 : 0)))];
      const campeao = fase === "campeão";
      const rotulo = `${t.nome} — ${fase} (${jogos} jogos, ${gols} gols)`;

      let atualizado = anotar(p, state.ano, `Seleção: ${rotulo}`, campeao ? `${t.nome} (Seleção)` : undefined);
      atualizado = {
        ...atualizado,
        confianca: Math.min(100, atualizado.confianca + (campeao ? 10 : 4)),
        valorMercado: Math.round(atualizado.valorMercado * (campeao ? 1.35 : 1.12)),
      };
      s = {
        ...s,
        jogadores: s.jogadores.map(x => x.id === p.id ? atualizado : x),
      };
      s = ganharReputacao(s, campeao ? REP_XP.atletaNaSelecao : REP_XP.transferenciaMedia);
      noticias.push({
        id: uid("NEW"), semana: 4, mes: 12, ano: state.ano,
        titulo: `${p.nome} na ${t.nome}: ${fase}`,
        texto: `${jogos} jogos, ${gols} gol(s) e ${assist} assistência(s) defendendo a seleção.`,
        tipo: "mundo",
      });
    }
  }

  return { state: s, noticias };
}

/**
 * Premiações individuais do ano: Bola de Ouro, melhor do campeonato,
 * artilharia, revelação e luva de ouro.
 */
export function premiosIndividuais(state: GameState): { state: GameState; noticias: NewsItem[] } {
  const noticias: NewsItem[] = [];
  let s = state;

  // ---- prêmios por campanha do atleta ----
  for (const p of state.jogadores) {
    const alvo = temporadaDoAno(p, state.ano);
    if (!alvo || alvo.temp.jogos < 8) continue;
    const t = alvo.temp;
    const nota = t.notaMedia ?? 0;
    const premios: string[] = [];

    for (const camp of t.competicoes ?? []) {
      if (camp.jogos >= 8 && camp.gols >= Math.max(8, Math.round(camp.jogos * 0.7))) {
        premios.push(`Artilheiro da ${camp.competicao}`);
      }
      if (camp.jogos >= 10 && camp.notaMedia >= 7.6 && Math.random() < 0.6) {
        premios.push(`Melhor jogador da ${camp.competicao}`);
      }
      if (camp.jogos >= 10 && camp.notaMedia >= 7.1) {
        premios.push(`Seleção da ${camp.competicao}`);
      }
    }
    if (p.idade <= 20 && t.jogos >= 12 && nota >= 7.2) premios.push("Revelação da temporada");
    if (p.posicao === "GOL" && t.jogos >= 12 && nota >= 7.2) premios.push("Luva de Ouro");

    if (!premios.length) continue;

    let atualizado = p;
    for (const premio of premios) atualizado = anotar(atualizado, state.ano, premio);
    atualizado = {
      ...atualizado,
      confianca: Math.min(100, atualizado.confianca + 3 * premios.length),
      valorMercado: Math.round(atualizado.valorMercado * (1 + 0.06 * premios.length)),
    };
    s = { ...s, jogadores: s.jogadores.map(x => x.id === p.id ? atualizado : x) };
    s = ganharReputacao(s, REP_XP.transferenciaPequena * premios.length);
    noticias.push({
      id: uid("NEW"), semana: 4, mes: 12, ano: state.ano,
      titulo: `${p.nome} é premiado em ${state.ano}`,
      texto: premios.join(" • "),
      tipo: "mundo",
    });
  }

  // ---- Bola de Ouro: só para quem realmente está entre os melhores do mundo ----
  const candidatos = s.jogadores
    .filter(p => p.status !== "Aposentado" && p.atual >= 88)
    .sort((a, b) => b.atual - a.atual);
  const craque = candidatos[0];
  if (craque && Math.random() < 0.35 + (craque.atual - 88) * 0.05) {
    const atualizado = anotar(craque, state.ano, `Bola de Ouro ${state.ano}`, `Bola de Ouro ${state.ano}`);
    s = {
      ...s,
      jogadores: s.jogadores.map(x => x.id === craque.id
        ? { ...atualizado, confianca: 100, valorMercado: Math.round(atualizado.valorMercado * 1.4) } : x),
    };
    s = ganharReputacao(s, REP_XP.premioMelhorEmpresario);
    noticias.push({
      id: uid("NEW"), semana: 4, mes: 12, ano: state.ano,
      titulo: `${craque.nome} vence a Bola de Ouro de ${state.ano}`,
      texto: `Cliente da ${s.agent.agencia} é eleito o melhor jogador do mundo.`,
      tipo: "mundo",
    });
  }

  return { state: s, noticias };
}
