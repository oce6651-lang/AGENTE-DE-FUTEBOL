import { rnd } from "./generators";
import { clubesAlvo, responder, montarProposta } from "./offers";
import { janelaAberta } from "./calendar";
import { categoriaDoAtleta, registrarPassagem } from "./season";
import { calcularValorMercado } from "./generators";
import type {
  Auction, AuctionBid, Club, GameState, Negotiation, NewsItem, Player, TimelineEvent,
} from "./types";

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

function data(state: GameState) {
  return `${state.mes}/${state.ano} • semana ${state.semana}`;
}

/** Custo de montar um leilão: assessoria de imprensa, dossiês e viagens. */
export const CUSTO_LEILAO = 1_400;
/** Semanas que o leilão fica aberto recebendo lances. */
export const SEMANAS_LEILAO = 3;

// ============================================================
// LEILÃO
// ============================================================

export function leilaoDoAtleta(state: GameState, playerId: string): Auction | undefined {
  return (state.leiloes ?? []).find(l => l.playerId === playerId && l.status === "aberto");
}

/**
 * Abre a concorrência por um atleta. Durante algumas semanas os clubes
 * interessados cobrem os lances uns dos outros — quem vencer manda a proposta.
 */
export function abrirLeilao(
  state: GameState, playerId: string,
): { state: GameState; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  if (!player) return { state, mensagem: "Atleta não encontrado." };
  if (leilaoDoAtleta(state, playerId)) return { state, mensagem: `${player.nome} já está em leilão.` };
  if (state.energia <= 0) return { state, mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTO_LEILAO) {
    return { state, mensagem: `Sem caixa para montar o leilão (R$ ${CUSTO_LEILAO.toLocaleString("pt-BR")}).` };
  }

  const leilao: Auction = {
    id: uid("AUC"), playerId, status: "aberto",
    semanasRestantes: SEMANAS_LEILAO, abertoEm: data(state),
    pisoValor: Math.round(player.valorMercado * 0.9),
    pisoSalario: Math.max(0, Math.round(player.salario * 1.1)),
    lances: [],
  };
  const not: NewsItem = {
    id: uid("NEW"), semana: state.semana, mes: state.mes, ano: state.ano,
    titulo: `${state.agent.agencia} coloca ${player.nome} no mercado`,
    texto: `A agência abriu concorrência por ${player.nome}. Clubes têm ${SEMANAS_LEILAO} semanas para apresentar lances.`,
    tipo: "mercado",
  };
  return {
    state: {
      ...state,
      energia: Math.max(0, state.energia - 1),
      dinheiro: state.dinheiro - CUSTO_LEILAO,
      leiloes: [leilao, ...(state.leiloes ?? [])],
      noticias: [not, ...state.noticias].slice(0, 150),
      financas: [{
        id: uid("FIN"), data: data(state),
        descricao: `Leilão de ${player.nome}`, valor: -CUSTO_LEILAO, tipo: "despesa" as const,
      }, ...state.financas],
    },
    mensagem: `Leilão aberto por ${player.nome}. Aguarde os lances.`,
  };
}

export function cancelarLeilao(state: GameState, leilaoId: string): { state: GameState; mensagem: string } {
  const leilao = (state.leiloes ?? []).find(l => l.id === leilaoId);
  if (!leilao || leilao.status !== "aberto") return { state, mensagem: "Leilão indisponível." };
  return {
    state: {
      ...state,
      leiloes: (state.leiloes ?? []).map(l => l.id === leilaoId ? { ...l, status: "cancelado" as const } : l),
    },
    mensagem: "Leilão cancelado. Os clubes foram avisados.",
  };
}

function melhorLance(l: Auction): AuctionBid | undefined {
  return [...l.lances].sort((a, b) => b.valor - a.valor || b.salario - a.salario)[0];
}

/** Um clube por vez avalia o atleta e decide se cobre o lance atual. */
function novosLances(state: GameState, leilao: Auction, player: Player): AuctionBid[] {
  const candidatos = clubesAlvo(state, player).slice(0, 10 + Math.floor(state.reputacao / 8));
  const atual = melhorLance(leilao);
  const piso = Math.max(leilao.pisoValor, atual ? Math.round(atual.valor * 1.08) : 0);
  const lances: AuctionBid[] = [];

  for (const clube of candidatos) {
    if (lances.length >= 3) break;
    if (atual && atual.clubId === clube.id) continue;
    const r = responder(state, clube, player);
    if (r.resultado !== "interessado" && r.resultado !== "pede_teste") continue;
    const empolgacao = janelaAberta(state.mes, clube.pais) ? 1 : 0.25;
    if (Math.random() > 0.45 * empolgacao) continue;

    const base = montarProposta(state, clube, player);
    const valor = Math.max(piso, Math.round(base.valorProposta * (1 + Math.random() * 0.35)));
    const teto = clube.categoria === "Elite" ? Infinity : clube.orcamento * 0.03;
    if (valor > teto) continue;
    lances.push({
      clubId: clube.id, clube: clube.nome, valor,
      salario: Math.round(Math.max(leilao.pisoSalario, base.salario) * (1 + Math.random() * 0.2)),
      duracaoAnos: base.duracaoAnos ?? 3,
      quando: data(state),
    });
  }
  return lances;
}

/**
 * Roda semanalmente: recebe lances e, ao fim do prazo, converte o vencedor
 * em uma proposta formal na mesa de negociações.
 */
export function processarLeiloes(state: GameState, eventos: string[]): GameState {
  let s = state;
  const abertos = (s.leiloes ?? []).filter(l => l.status === "aberto");
  if (!abertos.length) return s;

  for (const leilao of abertos) {
    const player = s.jogadores.find(p => p.id === leilao.playerId);
    if (!player) {
      s = { ...s, leiloes: (s.leiloes ?? []).map(l => l.id === leilao.id ? { ...l, status: "cancelado" as const } : l) };
      continue;
    }

    const lances = novosLances(s, leilao, player);
    const restante = leilao.semanasRestantes - 1;
    let atualizado: Auction = {
      ...leilao,
      lances: [...lances, ...leilao.lances],
      semanasRestantes: Math.max(0, restante),
    };
    for (const l of lances) {
      eventos.push(`${l.clube} ofereceu R$ ${l.valor.toLocaleString("pt-BR")} por ${player.nome}.`);
    }

    if (restante <= 0) {
      const vencedor = melhorLance(atualizado);
      if (!vencedor) {
        atualizado = { ...atualizado, status: "deserto" };
        eventos.push(`Leilão de ${player.nome} terminou sem lances.`);
      } else {
        const clube = s.clubes.find(c => c.id === vencedor.clubId)!;
        atualizado = { ...atualizado, status: "encerrado", vencedorClubId: vencedor.clubId };
        const neg: Negotiation = {
          ...montarProposta(s, clube, player),
          id: uid("NEG"),
          valorProposta: vencedor.valor,
          salario: vencedor.salario,
          duracaoAnos: vencedor.duracaoAnos,
          tipo: player.clube ? "Compra definitiva" : "Livre",
          origem: "leilao",
          expiraEm: 3,
          etapas: [{ data: data(s), texto: `${clube.nome} venceu o leilão por ${player.nome} com R$ ${vencedor.valor.toLocaleString("pt-BR")}.` }],
        };
        const not: NewsItem = {
          id: uid("NEW"), semana: s.semana, mes: s.mes, ano: s.ano,
          titulo: `${clube.nome} vence o leilão por ${player.nome}`,
          texto: `Lance final de R$ ${vencedor.valor.toLocaleString("pt-BR")} e salário de R$ ${vencedor.salario.toLocaleString("pt-BR")}/mês.`,
          tipo: "mercado",
        };
        s = { ...s, negociacoes: [neg, ...s.negociacoes], noticias: [not, ...s.noticias].slice(0, 150) };
        eventos.push(not.titulo);
      }
    }

    s = { ...s, leiloes: (s.leiloes ?? []).map(l => l.id === leilao.id ? atualizado : l) };
  }
  return s;
}

// ============================================================
// NEGOCIAÇÃO DE TERMOS
// ============================================================

export interface TermosPedidos {
  valor?: number;
  salario?: number;
  duracaoAnos?: number;
  comissao?: number;
  duracaoMeses?: number;
}

/**
 * O empresário pede novos termos: valor, salário, duração do contrato ou
 * comissão. Cada clube tem paciência limitada — exagerar derruba a conversa.
 */
export function negociarTermos(
  state: GameState, negId: string, pedido: TermosPedidos,
): { state: GameState; mensagem: string } {
  const neg = state.negociacoes.find(n => n.id === negId);
  if (!neg || neg.status !== "aberta") return { state, mensagem: "Negociação indisponível." };
  const clube = state.clubes.find(c => c.id === neg.clubId);
  const player = state.jogadores.find(p => p.id === neg.playerId);
  if (!clube || !player) return { state, mensagem: "Dados inválidos." };

  const rodadas = neg.rodadas ?? 0;
  if (rodadas >= 3) {
    return {
      state: { ...state, negociacoes: state.negociacoes.filter(n => n.id !== negId) },
      mensagem: `${clube.nome} perdeu a paciência e retirou a proposta.`,
    };
  }

  // Quanto se pede acima do que está na mesa define a chance de aceite.
  const gVal = pedido.valor ? pedido.valor / Math.max(1, neg.valorProposta) : 1;
  const gSal = pedido.salario ? pedido.salario / Math.max(1, neg.salario) : 1;
  const gCom = pedido.comissao ? pedido.comissao / Math.max(0.01, neg.comissao) : 1;
  const ganancia = Math.max(gVal, gSal, gCom);

  let chance = 78 - (ganancia - 1) * 130 - rodadas * 14
    + state.reputacao * 0.35 + clube.confiancaEmVoce * 0.25;
  if (clube.personalidade === "Pechincha") chance -= 22;
  if (clube.personalidade === "Imediatista") chance += 14;
  if (clube.categoria === "Elite") chance += 10;
  if (pedido.duracaoAnos && pedido.duracaoAnos > (neg.duracaoAnos ?? 2)) chance -= 8;

  const roll = rnd(0, 100);
  if (roll > chance + 30) {
    return {
      state: {
        ...state,
        clubes: state.clubes.map(c => c.id === clube.id
          ? { ...c, confiancaEmVoce: Math.max(0, c.confiancaEmVoce - 6) } : c),
        negociacoes: state.negociacoes.filter(n => n.id !== negId),
      },
      mensagem: `${clube.nome} encerrou a conversa: os pedidos passaram do limite.`,
    };
  }

  const aceitouTudo = roll <= chance;
  const meio = (atual: number, pedidoValor: number) => Math.round((atual + pedidoValor) / 2);
  const novo: Negotiation = {
    ...neg,
    rodadas: rodadas + 1,
    expiraEm: Math.max(2, neg.expiraEm),
    valorProposta: pedido.valor
      ? (aceitouTudo ? pedido.valor : Math.max(neg.valorProposta, meio(neg.valorProposta, pedido.valor)))
      : neg.valorProposta,
    salario: pedido.salario
      ? (aceitouTudo ? pedido.salario : Math.max(neg.salario, meio(neg.salario, pedido.salario)))
      : neg.salario,
    comissao: pedido.comissao
      ? Math.min(0.2, aceitouTudo ? pedido.comissao : (neg.comissao + pedido.comissao) / 2)
      : neg.comissao,
    duracaoAnos: pedido.duracaoAnos && aceitouTudo ? pedido.duracaoAnos : neg.duracaoAnos,
    duracaoMeses: pedido.duracaoMeses && aceitouTudo ? pedido.duracaoMeses : neg.duracaoMeses,
    etapas: [
      ...(neg.etapas ?? []),
      {
        data: data(state),
        texto: aceitouTudo
          ? `${clube.nome} aceitou os novos termos propostos por ${state.agent.agencia}.`
          : `${clube.nome} não aceitou tudo, mas melhorou a oferta.`,
      },
    ],
  };

  return {
    state: { ...state, negociacoes: state.negociacoes.map(n => n.id === negId ? novo : n) },
    mensagem: aceitouTudo
      ? `${clube.nome} aceitou os termos: R$ ${novo.valorProposta.toLocaleString("pt-BR")} • salário R$ ${novo.salario.toLocaleString("pt-BR")}.`
      : `${clube.nome} contrapropôs: R$ ${novo.valorProposta.toLocaleString("pt-BR")} • salário R$ ${novo.salario.toLocaleString("pt-BR")}.`,
  };
}

// ============================================================
// EMPRÉSTIMOS
// ============================================================

/** Monta o vínculo de empréstimo no momento da assinatura. */
export function iniciarEmprestimo(
  player: Player, ano: number, mes: number, meses: number,
): Player["emprestimo"] {
  const total = mes - 1 + meses;
  return {
    clubeOrigem: player.clube ?? "Sem clube",
    salarioOrigem: player.salario,
    contratoOrigemAno: player.contratoAteAno,
    meses,
    ate: { ano: ano + Math.floor(total / 12), mes: (total % 12) + 1 },
  };
}

function venceu(emp: NonNullable<Player["emprestimo"]>, ano: number, mes: number): boolean {
  return ano > emp.ate.ano || (ano === emp.ate.ano && mes >= emp.ate.mes);
}

/**
 * Semana a semana: quando o prazo do empréstimo acaba, o atleta volta ao clube
 * de origem com o salário e o contrato que tinha antes.
 */
export function processarEmprestimos(state: GameState, eventos: string[]): GameState {
  let s = state;
  for (const p of s.jogadores) {
    const emp = p.emprestimo;
    if (!emp || !venceu(emp, s.mes === 12 && s.semana === 4 ? s.ano : s.ano, s.mes)) continue;
    const origem = s.clubes.find(c => c.nome === emp.clubeOrigem);

    const evt: TimelineEvent = {
      ano: s.ano, mes: s.mes, semana: s.semana, tipo: "transferencia",
      texto: origem
        ? `Fim do empréstimo no ${p.clube}. Retornou ao ${origem.nome}.`
        : `Fim do empréstimo no ${p.clube}. Sem clube de origem, ficou livre.`,
    };
    const not: NewsItem = {
      id: uid("NEW"), semana: s.semana, mes: s.mes, ano: s.ano,
      titulo: origem
        ? `${p.nome} retorna ao ${origem.nome}`
        : `${p.nome} encerra empréstimo e fica livre`,
      texto: `O empréstimo de ${emp.meses} mês(es) chegou ao fim.`,
      tipo: "mercado",
    };

    const atualizado: Player = origem
      ? {
        ...p,
        clube: origem.nome,
        status: `No ${origem.nome}`,
        salario: emp.salarioOrigem,
        contratoAteAno: emp.contratoOrigemAno,
        valorMercado: calcularValorMercado(p.atual, p.potencial, p.idade, true, origem.categoria),
        emprestimo: undefined,
        temporadas: registrarPassagem(p, origem, categoriaDoAtleta(p), s.ano, {
          tipo: "Empréstimo", valor: 0, moeda: origem.pais === "Brasil" ? "R$" : "€",
          de: p.clube, para: origem.nome, ano: s.ano, mes: s.mes,
          salario: emp.salarioOrigem, data: data(s),
        }),
        historico: [...p.historico, `Retornou ao ${origem.nome} após empréstimo.`],
        timeline: [...p.timeline, evt],
      }
      : {
        ...p, clube: null, status: "Sem clube", salario: 0, valorMercado: 0,
        emprestimo: undefined, contratoAteAno: undefined,
        timeline: [...p.timeline, evt],
      };

    s = {
      ...s,
      noticias: [not, ...s.noticias].slice(0, 150),
      jogadores: s.jogadores.map(x => x.id === p.id ? atualizado : x),
    };
    eventos.push(not.titulo);
  }
  return s;
}

/** Resumo do vínculo atual do atleta, pronto para a tela de transferências. */
export function situacaoContratual(state: GameState, p: Player): string {
  if (!p.clube) return "Sem clube • livre no mercado";
  if (p.emprestimo) {
    return `Emprestado ao ${p.clube} até ${p.emprestimo.ate.mes}/${p.emprestimo.ate.ano} • volta ao ${p.emprestimo.clubeOrigem}`;
  }
  if (!p.contratoAteAno) return `No ${p.clube} • contrato indefinido`;
  const anos = p.contratoAteAno - state.ano;
  return anos <= 0
    ? `No ${p.clube} • contrato vence neste ano`
    : `No ${p.clube} • contrato até dezembro de ${p.contratoAteAno}`;
}

export type { Club };
