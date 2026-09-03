import { gerarJogador, pick, rid, rnd, calcularValorMercado } from "./generators";
import { ganharReputacao, REP_XP } from "./reputation";
import type { FinanceEntry, GameState, NewsItem, Player, ScoutNote, TimelineEvent } from "./types";
import { MESES } from "./types";

/**
 * Módulo de descoberta: formas de encontrar atletas fora do "ir a campo".
 * Rede de contatos, análise de vídeos, peneira própria da agência e
 * relatórios automáticos gerados pela Central de Olheiros.
 */

export const CUSTOS_DESCOBERTA = {
  contatos: 240,
  video: 80,
  peneiraPropria: 1_800,
};

function data(s: GameState) {
  return `${MESES[s.mes - 1]} ${s.ano} • Semana ${s.semana}`;
}

let SEQ = 5000;
function seq() { SEQ += 1; return SEQ; }

function pagar(state: GameState, valor: number, descricao: string): GameState {
  const fin: FinanceEntry = {
    id: rid("FIN", seq()), data: data(state), descricao, valor: -valor, tipo: "despesa",
  };
  return { ...state, dinheiro: state.dinheiro - valor, financas: [fin, ...state.financas] };
}

function novoAtleta(s: GameState, origem: string, faixaAtual: [number, number], faixaPot: [number, number], idade?: number): Player {
  const p = gerarJogador({
    cidade: s.agent.cidade, local: origem, nextId: seq(),
    ano: s.ano, mes: s.mes, semana: s.semana,
    estado: s.agent.estado, pais: s.agent.pais,
    forcarIdade: idade ?? rnd(12, 21),
    forcarAtual: faixaAtual, forcarPotencial: faixaPot,
  });
  const nota: ScoutNote = {
    ano: s.ano, mes: s.mes, semana: s.semana,
    partida: origem,
    nota: Math.max(3, Math.min(10, 5 + (p.atual - 40) / 20 + (Math.random() - 0.5) * 1.6)),
    texto: pick([
      "Chegou por indicação. Merece acompanhamento.",
      "Impressionou nos primeiros minutos de observação.",
      "Bruto, mas com base física interessante.",
      "Tecnicamente acima da média do grupo avaliado.",
    ]),
  };
  const evt: TimelineEvent = {
    ano: s.ano, mes: s.mes, semana: s.semana, tipo: "descoberta",
    texto: `Mapeado pela agência através de ${origem.toLowerCase()}.`,
  };
  return {
    ...p,
    observado: 1,
    relatorios: [nota],
    timeline: [...p.timeline, evt],
    valorMercado: calcularValorMercado(p.atual, p.potencial, p.idade, !!p.clube),
  };
}

function inserirNoRadar(s: GameState, novos: Player[]): GameState {
  const existentes = new Set(s.radar.map(p => p.id));
  const filtrados = novos.filter(p => !existentes.has(p.id));
  if (!filtrados.length) return s;
  return { ...s, radar: [...filtrados, ...s.radar].slice(0, 100) };
}

// ============================================================
// REDE DE CONTATOS — telefonemas, treinadores amigos, indicações
// ============================================================

export function acionarContatos(state: GameState): { state: GameState; mensagem: string; achados: Player[] } {
  if (state.energia <= 0) return { state, mensagem: "Sem energia nesta semana.", achados: [] };
  if (state.dinheiro < CUSTOS_DESCOBERTA.contatos)
    return { state, mensagem: `Sem caixa (R$ ${CUSTOS_DESCOBERTA.contatos}).`, achados: [] };

  let s = pagar(state, CUSTOS_DESCOBERTA.contatos, "Rede de contatos: ligações e deslocamentos");
  s = { ...s, energia: Math.max(0, s.energia - 1) };

  // quanto maior a reputação, mais gente atende o telefone
  const chance = 26 + s.reputacao * 0.6 + (s.upgrades.includes("olheiros") ? 22 : 0);
  if (rnd(1, 100) > Math.min(88, chance)) {
    return {
      state: s,
      mensagem: pick([
        "Ninguém tinha nada de novo para indicar esta semana.",
        "Dois treinadores prometeram avisar, mas nada concreto ainda.",
        "As indicações que chegaram já têm empresário.",
      ]),
      achados: [],
    };
  }

  const teto = 40 + Math.floor(s.reputacao * 0.5);
  const potTeto = 55 + Math.floor(s.reputacao * 0.4) + (s.upgrades.includes("olheiros") ? 8 : 0);
  const qtd = rnd(1, s.upgrades.includes("olheiros") ? 3 : 2);
  const achados = Array.from({ length: qtd }, () =>
    novoAtleta(s, "Indicação de contato", [8, Math.max(20, teto)], [45, Math.min(99, potTeto)]));

  s = inserirNoRadar(s, achados);
  s = ganharReputacao(s, 1);
  return {
    state: s,
    mensagem: `${achados.length} atleta(s) indicado(s) entraram no seu radar.`,
    achados,
  };
}

// ============================================================
// ANÁLISE DE VÍDEO — barata, mas nunca substitui o olho vivo
// ============================================================

export function analisarVideo(state: GameState, playerId: string): { state: GameState; mensagem: string } {
  const custo = Math.round(CUSTOS_DESCOBERTA.video * (state.upgrades.includes("analista") ? 0.5 : 1));
  if (state.dinheiro < custo) return { state, mensagem: `Sem caixa (R$ ${custo}).` };
  const alvo = state.radar.find(p => p.id === playerId) ?? state.jogadores.find(p => p.id === playerId);
  if (!alvo) return { state, mensagem: "Atleta não encontrado." };
  const jaVistos = alvo.relatorios.filter(r => r.partida === "Análise de vídeo").length;
  if (jaVistos >= 3) return { state, mensagem: `Não há mais imagens úteis de ${alvo.nome}.` };

  const s = pagar(state, custo, `Análise de vídeo: ${alvo.nome}`);
  const nota: ScoutNote = {
    ano: s.ano, mes: s.mes, semana: s.semana,
    partida: "Análise de vídeo",
    nota: Math.max(3, Math.min(10, 5.4 + (alvo.atual - 45) / 20 + (Math.random() - 0.5) * 1.4)),
    texto: pick([
      "Imagens curtas, mas dá para ver o padrão de movimentação.",
      "Compilado só com os melhores lances — cuidado com o viés.",
      "Vídeo de jogo completo: rende leitura tática confiável.",
      "Qualidade ruim de imagem, análise limitada.",
    ]),
  };
  const upd = (p: Player): Player => p.id !== playerId ? p : {
    ...p,
    observado: p.observado + 1,
    relatorios: [nota, ...p.relatorios].slice(0, 12),
  };
  return {
    state: { ...s, radar: s.radar.map(upd), jogadores: s.jogadores.map(upd) },
    mensagem: `Vídeos de ${alvo.nome} analisados. Ficha um pouco mais clara.`,
  };
}

// ============================================================
// PENEIRA PRÓPRIA DA AGÊNCIA
// ============================================================

export function podeFazerPeneiraPropria(state: GameState): { ok: boolean; motivo?: string } {
  if (state.reputacao < 8) return { ok: false, motivo: "Ninguém aparece numa peneira de agência desconhecida (exige 8 de reputação)." };
  if (state.energia < 2) return { ok: false, motivo: "Organizar uma peneira consome 2 de energia." };
  if (state.dinheiro < CUSTOS_DESCOBERTA.peneiraPropria)
    return { ok: false, motivo: `Sem caixa (R$ ${CUSTOS_DESCOBERTA.peneiraPropria.toLocaleString("pt-BR")}).` };
  return { ok: true };
}

export function realizarPeneiraPropria(state: GameState): { state: GameState; mensagem: string; achados: Player[] } {
  const pode = podeFazerPeneiraPropria(state);
  if (!pode.ok) return { state, mensagem: pode.motivo!, achados: [] };

  let s = pagar(state, CUSTOS_DESCOBERTA.peneiraPropria, "Peneira própria da agência: campo, arbitragem e divulgação");
  s = { ...s, energia: Math.max(0, s.energia - 2) };

  const inscritos = rnd(40, 120) + Math.floor(s.reputacao * 3)
    + (s.upgrades.includes("alojamento") ? 40 : 0);
  const aprovados = Math.max(0, Math.round(inscritos / 45) + (s.upgrades.includes("olheiros") ? 1 : 0));
  const teto = 34 + Math.floor(s.reputacao * 0.4);
  const achados = Array.from({ length: aprovados }, () =>
    novoAtleta(s, "Peneira da agência", [8, Math.max(18, teto)], [42, Math.min(99, 60 + Math.floor(s.reputacao * 0.4))], rnd(12, 19)));

  s = inserirNoRadar(s, achados);
  s = ganharReputacao(s, REP_XP.estrutura ? 2 : 2);

  const not: NewsItem = {
    id: rid("NEW", seq()), semana: s.semana, mes: s.mes, ano: s.ano,
    titulo: `${s.agent.agencia} realiza peneira aberta em ${s.agent.cidade}`,
    texto: `${inscritos} garotos apareceram. ${aprovados} seguiram para acompanhamento da agência.`,
    tipo: "descoberta",
  };
  s = { ...s, noticias: [not, ...s.noticias] };

  return {
    state: s,
    mensagem: aprovados
      ? `${inscritos} inscritos avaliados • ${aprovados} entraram no radar.`
      : `${inscritos} inscritos e nenhum nome aproveitável. Acontece.`,
    achados,
  };
}

// ============================================================
// CENTRAL DE OLHEIROS — trabalha sozinha toda semana
// ============================================================

export function relatoriosAutomaticos(state: GameState): { state: GameState; manchetes: string[] } {
  if (!state.upgrades.includes("olheiros")) return { state, manchetes: [] };
  if (Math.random() > 0.4) return { state, manchetes: [] };

  const teto = 38 + Math.floor(state.reputacao * 0.5);
  const achado = novoAtleta(state, "Relatório da Central de Olheiros",
    [8, Math.max(20, teto)], [50, Math.min(99, 62 + Math.floor(state.reputacao * 0.4))]);
  const s = inserirNoRadar(state, [achado]);
  return {
    state: s,
    manchetes: [`Central de Olheiros mapeou ${achado.nome} (${achado.posicao}, ${achado.idade} anos).`],
  };
}

/** Alojamento: atletas morando na estrutura da agência confiam mais e evoluem melhor. */
export function efeitoAlojamento(state: GameState): GameState {
  if (!state.upgrades.includes("alojamento")) return state;
  return {
    ...state,
    jogadores: state.jogadores.map(p =>
      p.status === "Aposentado" ? p : { ...p, confianca: Math.min(100, p.confianca + 1) }),
  };
}
