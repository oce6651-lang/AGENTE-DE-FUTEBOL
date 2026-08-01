import { rnd } from "./generators";
import type { Club, ClubResponse, GameState, Negotiation, NewsItem, Player } from "./types";

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

/** Nível mínimo que cada divisão espera de um reforço. */
const NIVEL_DIVISAO: Record<Club["categoria"], number> = {
  Amador: 18, "Serie D": 30, "Serie C": 42, "Serie B": 55, "Serie A": 68, Elite: 82,
};

/** Confiança mínima para o clube sequer atender o telefone. */
const PORTA_DE_ENTRADA: Record<Club["categoria"], number> = {
  Amador: 0, "Serie D": 8, "Serie C": 20, "Serie B": 36, "Serie A": 55, Elite: 75,
};

export const CUSTO_OFERTA = 220;

/** Clubes que fazem sentido receber a oferta: mesma região e porte compatível. */
export function clubesAlvo(state: GameState, player: Player): Club[] {
  return state.clubes
    .filter(c => c.nome !== player.clube)
    .filter(c => {
      const nivel = NIVEL_DIVISAO[c.categoria];
      // grandes clubes só olham para quem já é diferenciado
      if (nivel - player.atual > 22) return false;
      // clubes de fora do país exigem reputação internacional
      if (c.pais !== player.pais && state.reputacao < 55) return false;
      return true;
    })
    .sort((a, b) => {
      const regiaoA = a.estado === player.estado ? 0 : 1;
      const regiaoB = b.estado === player.estado ? 0 : 1;
      return regiaoA - regiaoB || NIVEL_DIVISAO[a.categoria] - NIVEL_DIVISAO[b.categoria];
    });
}

function responder(state: GameState, clube: Club, player: Player): ClubResponse {
  const base = { clubId: clube.id, clube: clube.nome };
  const acesso = clube.confiancaEmVoce + state.reputacao * 0.5
    + (state.upgrades.includes("sede") ? 10 : 0);
  if (acesso < PORTA_DE_ENTRADA[clube.categoria]) {
    return { ...base, resultado: "ignorou", texto: "Não retornou seus contatos. Sua agência ainda não é conhecida aqui." };
  }

  const exigido = NIVEL_DIVISAO[clube.categoria];
  if (player.atual < exigido - 6) {
    return { ...base, resultado: "abaixo_do_nivel", texto: `Avaliação: nível técnico abaixo do exigido pela ${clube.categoria}.` };
  }

  const precisa = clube.necessidades.includes(player.posicao);
  if (!precisa && Math.random() < 0.55) {
    return { ...base, resultado: "posicao_ocupada", texto: `O elenco já está servido de ${player.posicao} nesta temporada.` };
  }

  const teto = clube.orcamento * (clube.personalidade === "Pechincha" ? 0.004 : 0.02);
  if (player.valorMercado > teto) {
    return { ...base, resultado: "sem_orcamento", texto: `Interesse existe, mas o valor de R$ ${player.valorMercado.toLocaleString("pt-BR")} está fora do orçamento.` };
  }

  const jovem = player.idade <= 20;
  let peso = 20 + (player.atual - exigido) * 2.2 + clube.confiancaEmVoce * 0.35 + state.reputacao * 0.2;
  if (precisa) peso += 22;
  if (clube.personalidade === "Formador" && jovem) peso += 18;
  if (clube.personalidade === "Formador" && !jovem) peso -= 25;
  if (clube.personalidade === "Imediatista" && jovem) peso -= 22;
  if (clube.personalidade === "Vitrine" && player.potencial - player.atual > 18) peso += 16;
  if (clube.personalidade === "Pechincha") peso -= 10;
  if (!player.clube) peso -= 8;
  if (player.observado < 2) peso -= 10;

  const roll = rnd(0, 100);
  if (roll > peso + 25) {
    return { ...base, resultado: "pede_informacoes", texto: "Pediu relatórios completos e vídeos antes de qualquer decisão." };
  }
  if (roll > peso) {
    return { ...base, resultado: "pede_teste", texto: `${clube.tecnico} aceita avaliar o atleta em um período de testes.` };
  }
  return { ...base, resultado: "interessado", texto: `${clube.nome} quer abrir negociação imediatamente.` };
}

/**
 * Oferece um atleta ao mercado. Cada clube responde de um jeito e apenas
 * os realmente interessados abrem uma negociação.
 */
export function oferecerParaClubes(state: GameState, playerId: string): { state: GameState; respostas: ClubResponse[]; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  if (!player) return { state, respostas: [], mensagem: "Atleta não encontrado." };
  if (state.energia <= 0) return { state, respostas: [], mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTO_OFERTA) return { state, respostas: [], mensagem: `Sem caixa (R$ ${CUSTO_OFERTA}).` };

  // quanto maior a reputação, mais portas você consegue bater na mesma semana
  const limite = 4 + Math.floor(state.reputacao / 12);
  const alvos = clubesAlvo(state, player).slice(0, limite);
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
      const mult = clube.personalidade === "Pechincha" ? 0.55 : clube.personalidade === "Imediatista" ? 1.35 : 1;
      const valor = Math.max(2000, Math.round(player.valorMercado * mult * (0.7 + Math.random() * 0.6)));
      novasNegociacoes.push({
        id: uid("NEG"), playerId: player.id, clubId: clube.id,
        valorProposta: valor,
        comissao: 0.05 + Math.min(0.06, state.reputacao / 1000) + (state.upgrades.includes("juridico") ? 0.03 : 0),
        salario: Math.max(1200, Math.round(valor * 0.004)),
        status: "aberta",
        expiraEm: rnd(2, 4),
        criadaEm: `${state.mes}/${state.ano} • semana ${state.semana}`,
      });
      noticias.push({
        id: uid("NEW"), semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${clube.nome} abre negociação por ${player.nome}`,
        texto: `A oferta de ${state.agent.agencia} despertou interesse imediato.`,
        tipo: "mercado",
      });
    }
    if (r.resultado === "pede_teste" || r.resultado === "pede_informacoes") {
      s = { ...s, clubes: s.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 3) } : c) };
    }
  }

  s = {
    ...s,
    negociacoes: [...novasNegociacoes, ...s.negociacoes],
    noticias: [...noticias, ...s.noticias].slice(0, 150),
  };

  const interessados = respostas.filter(r => r.resultado === "interessado").length;
  return {
    state: s,
    respostas,
    mensagem: interessados
      ? `${interessados} clube(s) abriram negociação por ${player.nome}.`
      : `Nenhuma proposta imediata por ${player.nome}.`,
  };
}