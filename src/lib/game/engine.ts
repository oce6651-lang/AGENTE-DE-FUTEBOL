import { gerarClubes, gerarJogador, pick, rid, rnd } from "./generators";
import type { Agent, GameState, NewsItem, Player, FinanceEntry, Negotiation, Tryout, TimelineEvent, Club } from "./types";
import { LOCAIS, MESES } from "./types";

export function novoJogo(agent: Omit<Agent, "id">): GameState {
  const agentWithId: Agent = { ...agent, id: rid("EMP", 1) };
  return {
    agent: agentWithId,
    ano: 2026,
    mes: 3,
    semana: 1,
    dinheiro: 2000,
    prestigio: 1,
    reputacao: 2,
    jogadores: [],
    clubes: gerarClubes(),
    negociacoes: [],
    peneiras: [],
    noticias: [
      {
        id: rid("NEW", 1),
        semana: 1,
        mes: 3,
        ano: 2026,
        titulo: `${agentWithId.agencia} foi fundada em ${agentWithId.cidade}`,
        texto: `${agentWithId.nome} ${agentWithId.sobrenome} inicia sua carreira como empresário. Ninguém conhece você ainda — cada contato precisará ser conquistado.`,
        tipo: "info",
      },
    ],
    financas: [],
    seed: Math.floor(Math.random() * 1e9),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}

let PLAYER_COUNTER = 1;
let NEWS_COUNTER = 100;
let FIN_COUNTER = 1;
let NEG_COUNTER = 1;

function nextPlayerId(state: GameState) {
  const max = state.jogadores.reduce((m, p) => {
    const n = parseInt(p.id.replace("PLY", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, PLAYER_COUNTER);
  PLAYER_COUNTER = max + 1;
  return PLAYER_COUNTER;
}
function nextNewsId() { NEWS_COUNTER++; return rid("NEW", NEWS_COUNTER); }
function nextFinId() { FIN_COUNTER++; return rid("FIN", FIN_COUNTER); }
function nextNegId() { NEG_COUNTER++; return rid("NEG", NEG_COUNTER); }

export function dataLabel(s: GameState) {
  return `${MESES[s.mes - 1]} ${s.ano} • Semana ${s.semana}`;
}

export function buscarJogadores(state: GameState, local: string): { state: GameState; novos: Player[] } {
  // Reputação e prestígio influenciam quantos você consegue avistar.
  const base = 1 + Math.floor(state.reputacao / 25);
  const qtd = rnd(base, base + 2);
  const novos: Player[] = [];
  for (let i = 0; i < qtd; i++) {
    novos.push(gerarJogador({
      cidade: state.agent.cidade,
      local,
      nextId: nextPlayerId(state) + i,
      ano: state.ano, mes: state.mes, semana: state.semana,
    }));
  }
  const custo = 150; // viajar e observar custa
  const fin: FinanceEntry = {
    id: nextFinId(),
    data: dataLabel(state),
    descricao: `Viagem e observação em ${local}`,
    valor: -custo,
    tipo: "despesa",
  };
  const next: GameState = {
    ...state,
    dinheiro: state.dinheiro - custo,
    financas: [fin, ...state.financas],
  };
  return { state: next, novos };
}

export function conversar(state: GameState, player: Player): { state: GameState; sucesso: boolean; mensagem: string } {
  const custo = 80;
  const state2: GameState = {
    ...state,
    dinheiro: state.dinheiro - custo,
    financas: [{
      id: nextFinId(),
      data: dataLabel(state),
      descricao: `Conversa com ${player.nome}`,
      valor: -custo,
      tipo: "despesa",
    }, ...state.financas],
  };
  // Muito baixo no começo. Um empresário desconhecido raramente é ouvido.
  const chance = 5 + state.reputacao * 0.4 + state.prestigio * 6
    + (player.personalidade === "Humilde" ? 12 : 0)
    - (player.personalidade === "Ganancioso" ? 12 : 0)
    - (player.idade < 16 ? 10 : 0);
  const sucesso = rnd(1, 100) <= chance;
  return {
    state: state2,
    sucesso,
    mensagem: sucesso
      ? `${player.nome} aceitou conversar e demonstrou interesse.`
      : `${player.nome} mal olhou para o seu cartão.`,
  };
}

export function propor(state: GameState, player: Player): { state: GameState; sucesso: boolean; mensagem: string } {
  const custo = 300; // documentação, viagem, advogado
  let chance = 3 + state.reputacao * 0.35 + state.prestigio * 8 + player.observado * 3;
  if (player.idade < 18) chance -= 20; // pais precisam confiar
  if (player.personalidade === "Ambicioso" && state.prestigio >= 3) chance += 12;
  if (player.personalidade === "Ganancioso") chance -= 12;
  chance = Math.max(2, Math.min(85, chance));
  const sucesso = rnd(1, 100) <= chance;

  const fin: FinanceEntry = {
    id: nextFinId(),
    data: dataLabel(state),
    descricao: `Proposta e documentação para ${player.nome}`,
    valor: -custo,
    tipo: "despesa",
  };

  if (!sucesso) {
    const menor = player.idade < 18;
    return {
      state: { ...state, dinheiro: state.dinheiro - custo, financas: [fin, ...state.financas] },
      sucesso: false,
      mensagem: menor
        ? `Os pais de ${player.nome} não confiam em uma agência recém-fundada.`
        : `${player.nome} recusou — prefere aguardar uma oferta melhor.`,
    };
  }

  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana,
    tipo: "assinatura",
    texto: `Assinou com ${state.agent.agencia}.`,
  };
  const jogadorAtualizado: Player = {
    ...player,
    empresario: state.agent.id,
    historico: [...player.historico, `Assinou com ${state.agent.agencia}.`],
    timeline: [...player.timeline, evt],
    status: player.clube ? player.status : "Sem clube",
  };

  const noticia: NewsItem = {
    id: nextNewsId(),
    semana: state.semana,
    mes: state.mes,
    ano: state.ano,
    titulo: `${state.agent.agencia} contrata ${player.nome}`,
    texto: `${player.nome} (${player.idade} anos, ${player.posicao}) agora é representado pela ${state.agent.agencia}.`,
    tipo: "descoberta",
  };

  return {
    state: {
      ...state,
      dinheiro: state.dinheiro - custo,
      reputacao: Math.min(100, state.reputacao + 1),
      financas: [fin, ...state.financas],
      jogadores: [jogadorAtualizado, ...state.jogadores],
      noticias: [noticia, ...state.noticias],
    },
    sucesso: true,
    mensagem: `${player.nome} assinou com sua agência!`,
  };
}

export function observarJogador(state: GameState, playerId: string): GameState {
  const custo = 60;
  const player = state.jogadores.find(p => p.id === playerId);
  const nome = player?.nome ?? "jogador";
  return {
    ...state,
    dinheiro: state.dinheiro - custo,
    financas: [{
      id: nextFinId(),
      data: dataLabel(state),
      descricao: `Observação técnica de ${nome}`,
      valor: -custo,
      tipo: "despesa",
    }, ...state.financas],
    jogadores: state.jogadores.map(p => p.id === playerId ? { ...p, observado: p.observado + 1 } : p),
  };
}

// ============================================================
// PENEIRAS
// ============================================================

const CATEGORIA_EXIGENCIA: Record<Club["categoria"], number> = {
  Base: 38,
  Amador: 42,
  "Serie D": 52,
  "Serie C": 60,
  "Serie B": 68,
  "Serie A": 76,
  Elite: 84,
};

export function custoPeneira(clube: Club): number {
  // clubes maiores exigem viagem/logística
  const map: Record<Club["categoria"], number> = {
    Base: 120, Amador: 150, "Serie D": 220, "Serie C": 320,
    "Serie B": 480, "Serie A": 700, Elite: 1200,
  };
  return map[clube.categoria];
}

export function enviarPeneira(state: GameState, playerId: string, clubId: string): { state: GameState; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  const clube = state.clubes.find(c => c.id === clubId);
  if (!player || !clube) return { state, mensagem: "Dados inválidos." };
  if (player.clube) return { state, mensagem: `${player.nome} já está em um clube.` };
  if (state.peneiras.some(t => t.playerId === playerId && t.status === "em_andamento")) {
    return { state, mensagem: `${player.nome} já está em uma peneira.` };
  }
  const custo = custoPeneira(clube);
  if (state.dinheiro < custo) return { state, mensagem: `Sem caixa. Custo: R$ ${custo}.` };
  const duracao = clube.categoria === "Serie A" || clube.categoria === "Elite" ? 3 : 2;
  const peneira: Tryout = {
    id: nextTryoutId(),
    playerId, clubId,
    enviadaAno: state.ano, enviadaMes: state.mes, enviadaSemana: state.semana,
    duracaoSemanas: duracao,
    restanteSemanas: duracao,
    status: "em_andamento",
    notas: [`Enviado para teste no ${clube.nome} (${clube.categoria}).`],
  };
  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana,
    tipo: "peneira",
    texto: `Iniciou peneira no ${clube.nome}.`,
  };
  return {
    state: {
      ...state,
      dinheiro: state.dinheiro - custo,
      financas: [{
        id: nextFinId(),
        data: dataLabel(state),
        descricao: `Peneira: ${player.nome} → ${clube.nome}`,
        valor: -custo,
        tipo: "despesa",
      }, ...state.financas],
      peneiras: [peneira, ...state.peneiras],
      jogadores: state.jogadores.map(p => p.id === playerId
        ? { ...p, timeline: [...p.timeline, evt], status: `Em teste (${clube.nome})` }
        : p),
    },
    mensagem: `${player.nome} enviado para peneira no ${clube.nome}.`,
  };
}

function avaliarPeneira(state: GameState, t: Tryout): { s: GameState; not: NewsItem | null } {
  const player = state.jogadores.find(p => p.id === t.playerId);
  const clube = state.clubes.find(c => c.id === t.clubId);
  if (!player || !clube) return { s: state, not: null };

  // lesão em 6% dos casos
  if (Math.random() < 0.06) {
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana,
      tipo: "nota", texto: `Lesionou-se durante a peneira no ${clube.nome}.`,
    };
    return {
      s: {
        ...state,
        peneiras: state.peneiras.map(x => x.id === t.id ? {
          ...x, status: "lesionado",
          resultadoTexto: `Lesão muscular durante avaliação. Fora por algumas semanas.`,
          notas: [...x.notas, "Lesão durante o teste."],
        } : x),
        jogadores: state.jogadores.map(p => p.id === player.id
          ? { ...p, timeline: [...p.timeline, evt], status: "Recuperando-se" }
          : p),
      },
      not: {
        id: nextNewsId(),
        semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${player.nome} lesiona-se em peneira`,
        texto: `Contusão durante teste no ${clube.nome}. Recuperação em algumas semanas.`,
        tipo: "info",
      },
    };
  }

  const exig = CATEGORIA_EXIGENCIA[clube.categoria];
  const score = player.atual + rnd(-10, 10);

  if (score >= exig + 6) {
    // Aprovado — clube contrata
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana,
      tipo: "aprovado", texto: `Aprovado na peneira. Contratado pelo ${clube.nome}.`,
    };
    return {
      s: {
        ...state,
        reputacao: Math.min(100, state.reputacao + 2),
        peneiras: state.peneiras.map(x => x.id === t.id ? {
          ...x, status: "aprovado",
          resultadoTexto: `Aprovado! Recebeu contrato profissional do ${clube.nome}.`,
          notas: [...x.notas, `Aprovado com nota técnica ${score}.`],
        } : x),
        jogadores: state.jogadores.map(p => p.id === player.id ? {
          ...p,
          clube: clube.nome,
          status: `No ${clube.nome}`,
          historico: [...p.historico, `Aprovado na peneira do ${clube.nome}.`],
          timeline: [...p.timeline, evt],
        } : p),
      },
      not: {
        id: nextNewsId(),
        semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${player.nome} aprovado no ${clube.nome}`,
        texto: `${state.agent.agencia} coloca mais um atleta no futebol profissional.`,
        tipo: "mercado",
      },
    };
  }

  if (score >= exig - 4) {
    // Precisa de mais tempo — estende
    return {
      s: {
        ...state,
        peneiras: state.peneiras.map(x => x.id === t.id ? {
          ...x, status: "mais_tempo",
          restanteSemanas: 2,
          resultadoTexto: `Comissão técnica pediu mais 2 semanas de avaliação.`,
          notas: [...x.notas, `Nota inicial ${score}. Reavaliação solicitada.`],
        } : x),
      },
      not: null,
    };
  }

  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana,
    tipo: "reprovado", texto: `Reprovado na peneira do ${clube.nome}.`,
  };
  return {
    s: {
      ...state,
      peneiras: state.peneiras.map(x => x.id === t.id ? {
        ...x, status: "reprovado",
        resultadoTexto: `Reprovado. Nível técnico abaixo do exigido pelo ${clube.categoria}.`,
        notas: [...x.notas, `Reprovado (nota ${score}, exigido ${exig}).`],
      } : x),
      jogadores: state.jogadores.map(p => p.id === player.id
        ? { ...p, timeline: [...p.timeline, evt], status: "Sem clube" }
        : p),
    },
    not: null,
  };
}

export function avancarSemana(state: GameState): { state: GameState; eventos: string[] } {
  const eventos: string[] = [];
  let s: GameState = { ...state };

  s.semana += 1;
  if (s.semana > 4) {
    s.semana = 1;
    s.mes += 1;
    if (s.mes > 12) { s.mes = 1; s.ano += 1; }
    const desp = 300 + s.jogadores.length * 50;
    s = {
      ...s,
      dinheiro: s.dinheiro - desp,
      financas: [{
        id: nextFinId(),
        data: `${MESES[s.mes - 1]} ${s.ano}`,
        descricao: "Custos de operação da agência",
        valor: -desp,
        tipo: "despesa",
      }, ...s.financas],
    };
    eventos.push(`Custos mensais: R$ ${desp}`);
  }

  s.jogadores = s.jogadores.map(p => {
    if (p.atual < p.potencial && Math.random() < 0.35) {
      const inc = rnd(1, 2);
      return { ...p, atual: Math.min(p.potencial, p.atual + inc) };
    }
    return p;
  });

  if (Math.random() < 0.6) {
    const roll = Math.random();
    if (roll < 0.35 && s.jogadores.length > 0) {
      const jogador = pick(s.jogadores);
      const clube = pick(s.clubes);
      const valor = Math.floor(clube.orcamento * 0.001 * (jogador.atual / 60) * (0.5 + Math.random()));
      const salario = Math.max(1000, Math.floor(valor * 0.005));
      const comissao = 0.1;
      const neg: Negotiation = {
        id: nextNegId(),
        playerId: jogador.id,
        clubId: clube.id,
        valorProposta: valor,
        comissao,
        salario,
        status: "aberta",
        criadaEm: dataLabel(s),
      };
      s = { ...s, negociacoes: [neg, ...s.negociacoes] };
      const not: NewsItem = {
        id: nextNewsId(),
        semana: s.semana, mes: s.mes, ano: s.ano,
        titulo: `${clube.nome} demonstrou interesse em ${jogador.nome}`,
        texto: `Proposta de R$ ${valor.toLocaleString("pt-BR")} chegou à sua mesa.`,
        tipo: "mercado",
      };
      s = { ...s, noticias: [not, ...s.noticias] };
      eventos.push(not.titulo);
    } else if (roll < 0.6) {
      const not: NewsItem = {
        id: nextNewsId(),
        semana: s.semana, mes: s.mes, ano: s.ano,
        titulo: `Novo talento surgiu em ${s.agent.cidade}`,
        texto: `Boatos apontam um jovem promissor em ${pick(LOCAIS as unknown as string[])}.`,
        tipo: "descoberta",
      };
      s = { ...s, noticias: [not, ...s.noticias] };
      eventos.push(not.titulo);
    } else if (roll < 0.8) {
      const not: NewsItem = {
        id: nextNewsId(),
        semana: s.semana, mes: s.mes, ano: s.ano,
        titulo: "Um clube perguntou informações sobre um jogador",
        texto: "Você recebeu uma sondagem informal de um clube da região.",
        tipo: "info",
      };
      s = { ...s, noticias: [not, ...s.noticias] };
      eventos.push(not.titulo);
    } else {
      const not: NewsItem = {
        id: nextNewsId(),
        semana: s.semana, mes: s.mes, ano: s.ano,
        titulo: "Reportagem local elogiou sua agência",
        texto: `${s.agent.agencia} ganhou destaque na imprensa esportiva.`,
        tipo: "info",
      };
      s = { ...s, noticias: [not, ...s.noticias], prestigio: Math.min(5, s.prestigio + (Math.random() < 0.15 ? 1 : 0)) };
      eventos.push(not.titulo);
    }
  }

  if (s.semana === 1 && s.mes === 1) {
    s.jogadores = s.jogadores.map(p => ({ ...p, idade: p.idade + 1 }));
  }

  return { state: s, eventos };
}

export function responderNegociacao(
  state: GameState,
  negId: string,
  acao: "aceitar" | "recusar",
): { state: GameState; mensagem: string } {
  const neg = state.negociacoes.find(n => n.id === negId);
  if (!neg) return { state, mensagem: "Negociação não encontrada." };
  if (acao === "recusar") {
    return {
      state: {
        ...state,
        negociacoes: state.negociacoes.map(n => n.id === negId ? { ...n, status: "recusada" } : n),
      },
      mensagem: "Proposta recusada.",
    };
  }
  const player = state.jogadores.find(p => p.id === neg.playerId);
  const clube = state.clubes.find(c => c.id === neg.clubId);
  if (!player || !clube) return { state, mensagem: "Dados inválidos." };
  const receita = Math.floor(neg.valorProposta * neg.comissao);
  const fin: FinanceEntry = {
    id: nextFinId(),
    data: dataLabel(state),
    descricao: `Comissão pela transferência de ${player.nome} para ${clube.nome}`,
    valor: receita,
    tipo: "receita",
  };
  const not: NewsItem = {
    id: nextNewsId(),
    semana: state.semana, mes: state.mes, ano: state.ano,
    titulo: `${player.nome} é o novo reforço do ${clube.nome}`,
    texto: `Transferência fechada em R$ ${neg.valorProposta.toLocaleString("pt-BR")}.`,
    tipo: "mercado",
  };
  return {
    state: {
      ...state,
      dinheiro: state.dinheiro + receita,
      prestigio: Math.min(5, state.prestigio + (neg.valorProposta > 500_000 ? 1 : 0)),
      financas: [fin, ...state.financas],
      noticias: [not, ...state.noticias],
      negociacoes: state.negociacoes.map(n => n.id === negId ? { ...n, status: "aceita" } : n),
      jogadores: state.jogadores.map(p => p.id === player.id ? {
        ...p,
        clube: clube.nome,
        status: `No ${clube.nome}`,
        historico: [...p.historico, `Transferido para ${clube.nome} por R$ ${neg.valorProposta.toLocaleString("pt-BR")}.`],
      } : p),
    },
    mensagem: `Você ganhou R$ ${receita.toLocaleString("pt-BR")} de comissão!`,
  };
}