import { rnd } from "./generators";
import { categoriaDoAtleta } from "./season";
import { janelaAberta, statusJanela } from "./calendar";
import { continenteDoPais } from "./data/leagues";
import type {
  Club, ClubResponse, GameState, Negotiation, NewsItem, Player, TimelineEvent, Tryout,
} from "./types";

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Nível mínimo que cada divisão espera de um reforço.
 * A escada é dura de propósito: a maioria dos atletas circula entre a Série D
 * e a Série C, poucos alcançam a B ou a A e quase ninguém chega à elite.
 */
const NIVEL_DIVISAO: Record<Club["categoria"], number> = {
  Amador: 16, "Serie D": 30, "Serie C": 46, "Serie B": 64, "Serie A": 78, Elite: 90,
};

/** Confiança mínima para o clube sequer atender o telefone. */
const PORTA_DE_ENTRADA: Record<Club["categoria"], number> = {
  Amador: 0, "Serie D": 8, "Serie C": 22, "Serie B": 42, "Serie A": 62, Elite: 82,
};

/**
 * Nível técnico mínimo para o atleta sair do país. Só os melhores vão para
 * clubes grandes lá fora; os demais só interessam a clubes pequenos de
 * divisões inferiores mundo afora.
 */
const EXIGENCIA_EXTERIOR: Record<Club["categoria"], number> = {
  Amador: 24, "Serie D": 34, "Serie C": 50, "Serie B": 68, "Serie A": 82, Elite: 92,
};

export const CUSTO_OFERTA = 220;
/** Abordagem direta a um clube específico: viagem, reunião e apresentação. */
export const CUSTO_ABORDAGEM = 480;

/**
 * Quando o clube pede um teste ou vídeos, o atleta segue automaticamente para
 * uma avaliação presencial naquele clube — nada de burocracia extra.
 */
export function agendarAvaliacaoAutomatica(
  state: GameState, player: Player, clube: Club, motivo: string,
): GameState {
  const emAvaliacao = state.peneiras.some(t => t.playerId === player.id
    && (t.status === "em_andamento" || t.status === "mais_tempo"));
  if (emAvaliacao || !state.jogadores.some(p => p.id === player.id)) return state;

  const duracao = clube.categoria === "Serie A" || clube.categoria === "Elite" ? 3 : 2;
  const peneira: Tryout = {
    id: uid("TRY"), playerId: player.id, clubId: clube.id,
    enviadaAno: state.ano, enviadaMes: state.mes, enviadaSemana: state.semana,
    duracaoSemanas: duracao, restanteSemanas: duracao,
    status: "em_andamento",
    gratuita: true,
    categoria: categoriaDoAtleta(player),
    notas: [`${motivo} — avaliação marcada no CT do ${clube.nome} (${duracao} semanas).`],
  };
  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana, tipo: "peneira",
    texto: `Convidado para avaliação no ${clube.nome} após oferta da agência.`,
  };
  return {
    ...state,
    peneiras: [peneira, ...state.peneiras],
    jogadores: state.jogadores.map(p => p.id === player.id
      ? { ...p, timeline: [...p.timeline, evt], status: `Em avaliação (${clube.abrev})` } : p),
  };
}

/**
 * O empresário pode oferecer qualquer atleta a qualquer clube — o filtro é a
 * resposta, não a lista. Clubes muito acima do nível simplesmente recusam.
 */
export function clubesAlvo(state: GameState, player: Player): Club[] {
  return state.clubes
    .filter(c => c.nome !== player.clube)
    .sort((a, b) => {
      const regiaoA = a.estado === player.estado ? 0 : 1;
      const regiaoB = b.estado === player.estado ? 0 : 1;
      const gapA = Math.abs(NIVEL_DIVISAO[a.categoria] - player.atual);
      const gapB = Math.abs(NIVEL_DIVISAO[b.categoria] - player.atual);
      return regiaoA - regiaoB || gapA - gapB;
    });
}

/** Avaliação completa do clube: nível, idade, potencial, caixa e filosofia. */
export function responder(state: GameState, clube: Club, player: Player): ClubResponse {
  const base = { clubId: clube.id, clube: clube.nome };
  const exigido = NIVEL_DIVISAO[clube.categoria];
  const exterior = clube.pais !== player.pais;

  // Clubes valorizam potencial em atletas jovens: um garoto abaixo do nível hoje
  // ainda interessa se puder chegar ao patamar do clube antes dos 23 anos.
  const promessa = player.idade < 23 && player.potencial >= exigido + 4;
  const nivelConsiderado = promessa
    ? Math.max(player.atual, Math.round((player.atual + player.potencial) / 2))
    : player.atual;

  // clubes muito acima do nível do atleta nem abrem conversa
  if (exigido - nivelConsiderado > 12) {
    return { ...base, resultado: "abaixo_do_nivel", texto: `${clube.nome} nem avaliou o material: o atleta está muito distante do nível da ${clube.categoria}.` };
  }
  if (exterior) {
    // Sair para clubes do mesmo continente é bem mais simples do que atravessar o mundo.
    const mesmoContinente = continenteDoPais(clube.pais) === continenteDoPais(player.pais);
    const exige = Math.round(EXIGENCIA_EXTERIOR[clube.categoria] * (mesmoContinente ? 0.8 : 1));
    if (nivelConsiderado < exige) {
      return {
        ...base, resultado: "abaixo_do_nivel",
        texto: `Sair do país é para poucos: ${clube.nome} só analisa atletas a partir de ${exige} de nível técnico.`,
      };
    }
    const repBase = { Amador: 10, "Serie D": 14, "Serie C": 22, "Serie B": 35, "Serie A": 50, Elite: 70 }[clube.categoria];
    const repMin = Math.round(repBase * (mesmoContinente ? 0.6 : 1));
    if (state.reputacao < repMin && !state.upgrades.includes("filial")) {
      return { ...base, resultado: "ignorou", texto: "Clube do exterior: não negocia com agências sem projeção internacional." };
    }
  }

  const acesso = clube.confiancaEmVoce + state.reputacao * 0.5
    + (state.upgrades.includes("sede") ? 10 : 0);
  if (acesso < PORTA_DE_ENTRADA[clube.categoria]) {
    return { ...base, resultado: "ignorou", texto: "Não retornou seus contatos. Sua agência ainda não é conhecida aqui." };
  }

  if (nivelConsiderado < exigido - 4 && !(clube.personalidade === "Formador" && player.idade <= 19 && player.potencial >= exigido + 8)) {
    return { ...base, resultado: "abaixo_do_nivel", texto: `Avaliação: nível técnico abaixo do exigido pela ${clube.categoria}.` };
  }

  const precisa = clube.necessidades.includes(player.posicao);
  if (!precisa && Math.random() < 0.55) {
    return { ...base, resultado: "posicao_ocupada", texto: `O elenco já está servido de ${player.posicao} nesta temporada.` };
  }

  // Gigantes da elite praticamente nunca deixam de contratar por falta de caixa.
  const semLimite = clube.categoria === "Elite";
  const teto = clube.orcamento * (clube.personalidade === "Pechincha" ? 0.004 : 0.02);
  if (!semLimite && player.valorMercado > teto) {
    return { ...base, resultado: "sem_orcamento", texto: `Interesse existe, mas o valor de R$ ${player.valorMercado.toLocaleString("pt-BR")} está fora do orçamento.` };
  }

  const jovem = player.idade <= 20;
  let peso = 18 + (nivelConsiderado - exigido) * 2.2 + clube.confiancaEmVoce * 0.35 + state.reputacao * 0.2;
  if (precisa) peso += 22;
  if (promessa) peso += 12;
  if (clube.personalidade === "Formador" && jovem) peso += 18;
  if (clube.personalidade === "Formador" && !jovem) peso -= 25;
  if (clube.personalidade === "Imediatista" && jovem) peso -= 22;
  if (clube.personalidade === "Vitrine" && player.potencial - player.atual > 18) peso += 16;
  if (clube.personalidade === "Pechincha") peso -= 10;
  if (clube.personalidade === "Tradicional") peso -= 6;
  if (!player.clube) peso -= 8;
  if (player.observado < 2) peso -= 10;
  if (player.idade >= 30) peso -= 12;
  // fora da janela de transferências o mercado quase congela
  const janela = janelaAberta(state.mes, clube.pais);
  if (!janela) peso -= 45;

  const roll = rnd(0, 100);
  if (!janela && roll > peso + 12) {
    return {
      ...base, resultado: "pede_informacoes",
      texto: `${statusJanela(state, clube.pais)}. O clube pediu relatórios e quer ver o atleta de perto antes da próxima janela.`,
    };
  }
  if (roll > peso + 25) {
    return { ...base, resultado: "pede_informacoes", texto: "Pediu relatórios completos e vídeos antes de qualquer decisão." };
  }
  if (roll > peso) {
    return { ...base, resultado: "pede_teste", texto: `${clube.tecnico} aceita avaliar o atleta em um período de testes.` };
  }
  return { ...base, resultado: "interessado", texto: `${clube.nome} quer abrir negociação imediatamente.` };
}

/** Monta uma proposta coerente com o porte do clube e o valor do atleta. */
export function montarProposta(state: GameState, clube: Club, player: Player): Negotiation {
  const mult = clube.personalidade === "Pechincha" ? 0.55 : clube.personalidade === "Imediatista" ? 1.35 : 1;
  const semContrato = !player.clube;
  const valor = semContrato
    ? 0
    : Math.max(500, Math.round(player.valorMercado * mult * (0.7 + Math.random() * 0.6)));
  const emprestimo = !semContrato && player.idade <= 21 && Math.random() < 0.25;
  const salarioBase: Record<Club["categoria"], number> = {
    Amador: 0, "Serie D": 1_400, "Serie C": 3_000, "Serie B": 8_000, "Serie A": 22_000, Elite: 90_000,
  };
  const salario = Math.round(
    (salarioBase[clube.categoria] * (0.6 + player.atual / 70) * (0.8 + Math.random() * 0.5)) / 100) * 100;
  return {
    id: uid("NEG"), playerId: player.id, clubId: clube.id,
    valorProposta: emprestimo ? 0 : valor,
    comissao: 0.05 + Math.min(0.06, state.reputacao / 1000) + (state.upgrades.includes("juridico") ? 0.03 : 0),
    salario,
    status: "aberta",
    expiraEm: rnd(2, 4),
    criadaEm: `${state.mes}/${state.ano} • semana ${state.semana}`,
    tipo: emprestimo ? "Empréstimo" : semContrato ? "Livre" : "Compra definitiva",
    duracaoAnos: emprestimo ? 1 : player.idade <= 20 ? rnd(3, 5) : rnd(1, 3),
    categoria: categoriaDoAtleta(player),
    etapas: [
      { data: `${state.mes}/${state.ano}`, texto: `${state.agent.agencia} ofereceu ${player.nome} ao ${clube.nome}.` },
      { data: `${state.mes}/${state.ano}`, texto: `${clube.tecnico} aprovou o perfil e a diretoria apresentou proposta.` },
    ],
  };
}

/**
 * Oferece um atleta ao mercado. Cada clube responde de um jeito e apenas
 * os realmente interessados abrem uma negociação.
 */
export function oferecerParaClubes(
  state: GameState, playerId: string, clubIds?: string[],
): { state: GameState; respostas: ClubResponse[]; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  if (!player) return { state, respostas: [], mensagem: "Atleta não encontrado." };
  if (state.energia <= 0) return { state, respostas: [], mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTO_OFERTA) return { state, respostas: [], mensagem: `Sem caixa (R$ ${CUSTO_OFERTA}).` };

  const limite = 4 + Math.floor(state.reputacao / 12);
  const alvos = clubIds?.length
    ? state.clubes.filter(c => clubIds.includes(c.id)).slice(0, limite)
    : clubesAlvo(state, player).slice(0, limite);
  if (!alvos.length) {
    return { state, respostas: [], mensagem: `Nenhum clube compatível com o perfil de ${player.nome} no momento.` };
  }

  const respostas = alvos.map(c => responder(state, c, player));

  let s: GameState = {
    ...state,
    energia: Math.max(0, state.energia - 1),
    dinheiro: state.dinheiro - CUSTO_OFERTA,
    financas: [{
      id: uid("FIN"), data: `${state.mes}/${state.ano} • semana ${state.semana}`,
      descricao: `Ofertas de ${player.nome} ao mercado`, valor: -CUSTO_OFERTA, tipo: "despesa" as const,
    }, ...state.financas],
  };

  const novasNegociacoes: Negotiation[] = [];
  const noticias: NewsItem[] = [];

  for (const r of respostas) {
    const clube = state.clubes.find(c => c.id === r.clubId)!;
    if (r.resultado === "interessado") {
      novasNegociacoes.push(montarProposta(state, clube, player));
      noticias.push({
        id: uid("NEW"), semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${clube.nome} abre negociação por ${player.nome}`,
        texto: `A oferta de ${state.agent.agencia} despertou interesse imediato.`,
        tipo: "mercado",
      });
    }
    if (r.resultado === "pede_teste" || r.resultado === "pede_informacoes") {
      s = { ...s, clubes: s.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 3) } : c) };
      s = agendarAvaliacaoAutomatica(s, player, clube, r.texto);
    }
  }

  s = {
    ...s,
    negociacoes: [...novasNegociacoes, ...s.negociacoes],
    noticias: [...noticias, ...s.noticias].slice(0, 150),
  };

  const interessados = respostas.filter(r => r.resultado === "interessado").length;
  const testes = respostas.filter(r => r.resultado === "pede_teste" || r.resultado === "pede_informacoes").length;
  return {
    state: s,
    respostas,
    mensagem: interessados
      ? `${interessados} clube(s) abriram negociação por ${player.nome}.`
      : testes
        ? `Nenhuma proposta, mas ${player.nome} foi chamado para avaliação.`
        : `Nenhuma proposta imediata por ${player.nome}.`,
  };
}

/**
 * Abordagem direta: o empresário escolhe um clube específico e tenta encaixar
 * o atleta. Pode terminar em proposta, em convite para teste ou em porta fechada.
 */
export function negociarComClube(
  state: GameState, playerId: string, clubId: string,
): { state: GameState; resposta: ClubResponse | null; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  const clube = state.clubes.find(c => c.id === clubId);
  if (!player || !clube) return { state, resposta: null, mensagem: "Dados inválidos." };
  if (player.clube === clube.nome) return { state, resposta: null, mensagem: `${player.nome} já está no ${clube.nome}.` };
  if (state.energia <= 0) return { state, resposta: null, mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTO_ABORDAGEM) {
    return { state, resposta: null, mensagem: `Sem caixa para a reunião (R$ ${CUSTO_ABORDAGEM}).` };
  }

  const resposta = responder(state, clube, player);
  let s: GameState = {
    ...state,
    energia: Math.max(0, state.energia - 1),
    dinheiro: state.dinheiro - CUSTO_ABORDAGEM,
    financas: [{
      id: uid("FIN"), data: `${state.mes}/${state.ano} • semana ${state.semana}`,
      descricao: `Reunião no ${clube.nome} por ${player.nome}`,
      valor: -CUSTO_ABORDAGEM, tipo: "despesa" as const,
    }, ...state.financas],
  };

  if (resposta.resultado === "interessado") {
    const neg = montarProposta(s, clube, player);
    const not: NewsItem = {
      id: uid("NEW"), semana: s.semana, mes: s.mes, ano: s.ano,
      titulo: `${clube.nome} abre negociação por ${player.nome}`,
      texto: `Reunião presencial de ${s.agent.agencia} destravou a conversa.`,
      tipo: "mercado",
    };
    s = {
      ...s,
      negociacoes: [neg, ...s.negociacoes],
      noticias: [not, ...s.noticias].slice(0, 150),
      clubes: s.clubes.map(c => c.id === clube.id
        ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 5) } : c),
    };
  } else if (resposta.resultado === "pede_teste" || resposta.resultado === "pede_informacoes") {
    s = {
      ...s,
      clubes: s.clubes.map(c => c.id === clube.id
        ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 6) } : c),
    };
    s = agendarAvaliacaoAutomatica(s, player, clube, resposta.texto);
  }

  const extra = (resposta.resultado === "pede_teste" || resposta.resultado === "pede_informacoes")
    ? ` ${player.nome} foi enviado para avaliação no ${clube.nome}.` : "";
  return { state: s, resposta, mensagem: resposta.texto + extra };
}
